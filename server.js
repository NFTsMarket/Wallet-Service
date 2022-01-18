var express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
var bodyParser = require('body-parser');
var Wallet = require('./models/walletModel.js')
var pubsubMessage = require('./pubsubMessages')
var { authorizedAdmin, authorizedClient } = require('./middlewares/authorized-roles')
const { pubsub, publishPubSubMessage } = require("./pubsub");
var cors = require('cors')

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());

app.use(cors())


app.get("/", (req, res) => {
    res.redirect("https://app.swaggerhub.com/apis-docs/D-RHYM/Wallet-Service/1.0");
});

app.get(BASE_API_PATH + "/", (req, res) => {
    res.redirect("https://app.swaggerhub.com/apis-docs/D-RHYM/Wallet-Service/1.0");
});


//Crear Wallet
async function createWallet(user, fund, lastTransactions, deleted, createdAt, updatedAt) {
    var wallet = new Wallet({ user: user, fund: fund, lastTransactions: lastTransactions, deleted: deleted, createdAt: createdAt, updatedAt: updatedAt });
    await wallet.save();

    pubsubMessage.sendMessageCreatedWallet(wallet);

    return wallet;
}

app.post(BASE_API_PATH + "/wallet", authorizedClient, async (req, res) => {
    try {
        var wallet = createWallet(req.body.user, req.body.fund, req.body.lastTransactions, req.body.deleted, req.body.createdAt, req.body.updatedAt);

        res.setHeader('Location', '/wallet/' + wallet._id);

        return res.status(201).json(wallet);
    } catch (e) {
        return res.status(400).json(e);
    }
}
);

//Listar Wallets
app.get(BASE_API_PATH + "/wallet", authorizedClient, (req, res) => {
    let limitatt = (req.query["limit"] != null && !Number.isNaN(req.query["limit"])) ? req.query["limit"] : 0;
    let offset = (req.query["offset"] != null && !Number.isNaN(req.query["offset"])) ? req.query["offset"] : 0;
    let sortatt = (req.query["sort"] != null) ? req.query["sort"] : null;
    let order = (req.query["order"] != null) ? req.query["order"] : 1;
    let filters = req.query;
    Object.keys(filters).forEach(x => {
        if (x == "sort" || x == "order" || x == "limit" || x == "offset") {
            delete filters[x];
        }
    });
    Wallet.find(filters, null, { sort: { [sortatt]: order, _id: 1 }, limit: limitatt, skip: offset * limitatt }, function (err, wallet) {
        if (err) return res.status(500).json(err);
        return res.status(200).json(wallet);
    });

});

// Modificar Wallet
app.put(BASE_API_PATH + "/wallet/:id", authorizedClient, async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json("A wallet with that id could not be found, since it's not a valid id.");
    }
    var filter = { user: req.params.id };
    Wallet.findOneAndUpdate(filter, req.body, function (err, doc) {
        if (!doc) {
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });
    var wallet = await Wallet.findOne(filter);
    if (wallet) {
        pubsubMessage.sendMessageUpdatedWallet(wallet);
        return res.status(200).json(wallet);
    } else {
        return res.status(404).json("A wallet with that id could not be found.");
    }
});

//Obtener un Wallet
app.get(BASE_API_PATH + "/wallet/:id", authorizedClient, (req, res) => {   
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json("A wallet with that id could not be found, since it's not a valid id.");
    }

    var filter = { user: req.params.id };
    Wallet.findOne(filter, function (err, wallet) {
        if (err) {

            return res.status(500).json(err);
        } else if (wallet) {
            return res.status(200).json(wallet);
        } else {
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });
});

// Borrar Wallet

app.delete(BASE_API_PATH + "/wallet/:id", authorizedClient, (req, res) => {
    if(!ObjectId.isValid(req.params.id)){
        return res.status(400).json("A wallet with that id could not be found, since it's not a valid id.");
    }

    Wallet.findByIdAndDelete(req.params.id, function (err, wallet) {
        if (err) {
            return res.status(500).json(err);
        }
        else if (wallet) {
            pubsubMessage.sendMessageDeletedWallet(wallet);
            return res.status(200).json();
        } else {
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });
});

// Modificar Wallet
app.put(BASE_API_PATH + "/wallet/:id/:fund", authorizedClient, (req, res) => {
    if (!req.params.fund.match(/\d+\.\d+/)) {
        return res.status(400).json("Invalid fund format.");
    } else {
        var filter = { user: req.params.id };
        Wallet.findOne(filter, async function (err, wallet) {
            if (err) {
                return res.status(500).json(err);
            } else if (wallet) {
                try {
                    var temporalTransactions = wallet.lastTransactions;
                    temporalTransactions.push(req.params.fund);
                    Wallet.findOneAndUpdate(filter, { fund: wallet.fund + Number(req.params.fund), lastTransactions: temporalTransactions }, function (err, doc) {
                        if (!doc) {
                            return res.status(400).json("A wallet with that id could not be found.");
                        }
                    });
                    var wallet = await Wallet.findOne(filter);
                    if (wallet) {
                        pubsubMessage.sendMessageUpdatedWallet(wallet);
                        return res.status(200).json(wallet);
                    } else {
                        return res.status(404).json("A wallet with that id could not be found.");
                    }
                } catch (e) {
                    return res.status(500).json(e);
                }
            } else {
                return res.status(404).json("A wallet with that id could not be found.");
            }
        });
    }
});

function addAmountToUserWallet(userId, amount) {
    console.log("USER ID", userId);
    var filter = { user: userId };
    Wallet.findOne(filter, async function (err, wallet) {
        if (err) {
            console.log("DB error.");
        } else if (wallet) {
            try {
                var today = new Date().toLocaleDateString();
                var temporalTransactions = wallet.lastTransactions;
                temporalTransactions.push(amount);
                Wallet.findOneAndUpdate(filter, { fund: wallet.fund + amount, lastTransactions: temporalTransactions, updatedAt: today }, function (err, doc) {
                    if (!doc) {
                        console.log("A wallet with that id could not be found.");
                    }
                });
                var wallet = await Wallet.findOne(filter);
                if (wallet) {
                    pubsubMessage.sendMessageUpdatedWallet(wallet);
                } else {
                    console.log("A wallet with that id could not be found.");
                }
            } catch (e) {
                console.log("A wallet with that id could not be found.");
            }
        } else {
            console.log("A wallet with that id could not be found.");
        }
    });
}


// Pub/Sub, mensaje = una publicacion con datos, pero sin topic

// Para probarlo:
// Crear un usuario y comprobar que se le crea una wallet

pubsub.subscription('wallet-created-user').on('message', message => {
    const user = JSON.parse(message.data.toString());
    console.log("MENSAJE" ,user);
    createWallet(user.id, 0, [], false, new Date().toISOString(), new Date().toISOString())
    message.ack()
});

// Para probarlo:
// Borrar un usuario y comprobar que se le borra la wallet
pubsub.subscription('wallet-deleted-user').on('message', message => {
    const user = JSON.parse(message.data.toString());
    console.log("MENSAJE DELETE" ,user);
    Wallet.findOneAndDelete({ user: user.id }, function (err, wallet) {
        if(wallet){
            sendMessageDeletedWallet(wallet);
        }
    });

    message.ack()
});


// Para probarlo:
// Realizar una compra y comprobar que le suma a una cartera la cantidad y a la otra se le resta y que se añade la transacción a la lista
pubsub.subscription('wallet-created-purchase').on('message', message => {
    const user = JSON.parse(message.data.toString());
    let buyerId = user.buyerId;
    let cost = user.amount;
    addAmountToUserWallet(buyerId, -cost);
    message.ack()
});

pubsub.subscription('wallet-updated-purchase').on('message', message => {
    const user = JSON.parse(message.data.toString());
    let sellerId = user.sellerId;
    let cost = user.amount;
    addAmountToUserWallet(sellerId, cost);
    message.ack()
});

pubsub.subscription('wallet-deleted-purchase').on('message', message => {
    const user = JSON.parse(message.data.toString());
    let buyerId = user.buyerId;
    let cost = user.amount;
    addAmountToUserWallet(buyerId, cost);
    message.ack()
});

app.get(BASE_API_PATH + "/healthz", (req, res) => {
    res.sendStatus(200);
});

module.exports = app;