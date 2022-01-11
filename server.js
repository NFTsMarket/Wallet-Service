var express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
var bodyParser = require('body-parser');
var Wallet = require('./models/walletModel.js')
var { pubsub, sendMessageCreatedWallet, sendMessageUpdatedWallet, sendMessageDeletedWallet } = require('./pubsubMessages'),

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());

//Crear Wallet
function createWallet(user, fund, lastTransactions, deleted, createdAt, updatedAt) {
    var wallet = new Wallet({user: user, fund: fund, lastTransactions: lastTransactions, deleted: deleted, createdAt: createdAt, updatedAt: updatedAt});
    await wallet.save();

    sendMessageCreatedWallet(wallet, res);

    return wallet;
}

app.post(BASE_API_PATH + "/wallet", async (req, res) => {
    try{
        var wallet = createWallet(req.body.user, req.body.fund, req.body.lastTransactions, req.body.deleted, req.body.createdAt, req.body.updatedAt);

        res.setHeader('Location', '/wallet/'+wallet._id);

        return res.status(201).json(wallet);
    } catch(e){
        return res.status(400).json(e);
    }
}
);

//Listar Wallets
app.get(BASE_API_PATH + "/wallet", (req, res) => {
    let limitatt = (req.query["limit"] != null && !Number.isNaN(req.query["limit"]) ) ? req.query["limit"] : 0;
    let offset = (req.query["offset"] != null && !Number.isNaN(req.query["offset"]) ) ? req.query["offset"] : 0;
    let sortatt = (req.query["sort"] != null) ? req.query["sort"] : null;
    let order = (req.query["order"] != null) ? req.query["order"] : 1;
    let filters = req.query;
    Object.keys(filters).forEach(x => {
        if (x == "sort" || x == "order" || x == "limit" || x == "offset") {
            delete filters[x];
        }
    });
    Wallet.find(filters, null, { sort: { [sortatt]: order, _id: 1 }, limit: limitatt, skip: offset*limitatt }, function (err, wallet) {
        if (err) return res.status(500).json(err);
        return res.status(200).json(wallet);
    });

});

// Modificar Wallet
app.put(BASE_API_PATH + "/wallet/:id", async (req, res) => {
    try{
        var filter = { _id: req.params.id };
        Wallet.findOneAndUpdate(filter, req.body, function(err, doc) {
            if(!doc){
                return res.status(400).json("A wallet with that id could not be found.");
            }
        });
        var wallet = await Wallet.findOne(filter);
        if(wallet){
            sendMessageUpdatedWallet(wallet, res);
            return res.status(200).json(wallet);
        }else{
            return res.status(404).json("A wallet with that id could not be found.");
        }
    }catch(e){
        return res.status(500).json(e);
    }
});

//Obtener un Wallet
app.get(BASE_API_PATH + "/wallet/:id", (req, res) => {
    if(!ObjectId.isValid(req.params.id)){
        return res.status(400).json("A wallet with that id could not be found, since it's not a valid id.");
    }

    var filter = { _id: req.params.id };
    Wallet.findOne(filter,function (err, wallet) {
        if (err){
            return res.status(500).json(err);
        }else if(wallet){
            return res.status(200).json(wallet);
        }else{
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });
});

// Borrar Wallet
app.delete(BASE_API_PATH + "/wallet/:id", (req, res) => {
    if(!ObjectId.isValid(req.params.id)){
        return res.status(400).json("A wallet with that id could not be found, since it's not a valid id.");
    }

    Wallet.findByIdAndDelete(req.params.id,function (err, wallet) {
        if (err){
             return res.status(500).json(err);
            }
        else if(wallet){
            sendMessageDeletedWallet(wallet, res);
            return res.status(200).json();
        }else{
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });
});

app.put(BASE_API_PATH + "/wallet/:id/:fund", (req, res) => {
    if (!req.params.fund.match(/\d+\.\d+/)) {
        return res.status(400).json("Invalid fund format.");
    } else {
        var filter = { _id: req.params.id };
        Wallet.findOne(filter, async function (err, wallet) {
            if (err){
                return res.status(500).json(err);
            }else if(wallet){
                try{
                    Wallet.findOneAndUpdate(filter, {fund: wallet.fund + Number(req.params.fund)}, function(err, doc) {
                        if(!doc){
                            return res.status(400).json("A wallet with that id could not be found.");
                        }
                    });
                    var wallet = await Wallet.findOne(filter);
                    if(wallet){
                        sendMessageUpdatedWallet(wallet, res);
                        return res.status(200).json(wallet);
                    }else{
                        return res.status(404).json("A wallet with that id could not be found.");
                    }
                }catch(e){
                    return res.status(500).json(e);
                }
            }else{
                return res.status(404).json("A wallet with that id could not be found.");
            }
        });
    }
});

// Pub/Sub, mensaje = una publicacion con datos, pero sin topic

pubsub.subscription('walled-created-user').on('message', message => {
    createWallet(message.body.user.email, 0, [], false, new Date().toISOString(), new Date().toISOString())
    message.ack()
});

pubsub.subscription('walled-deleted-user').on('message', message => {
    Wallet.findOneAndDelete({ user: message.body.user.email }, function (err, wallet) {
        if (err){
             return res.status(500).json(err);
            }
        else if(wallet){
            sendMessageDeletedWallet(wallet, res);

            return res.status(200).json();
        }else{
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });

    message.ack()
});

app.get(BASE_API_PATH + "/healthz", (req, res) => {
    res.sendStatus(200);
});

module.exports = app;