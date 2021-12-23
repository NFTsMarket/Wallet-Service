var express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
var bodyParser = require('body-parser');
var Wallet = require('./models/walletModel.js')

//var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());


//Crear Wallet
app.post("/wallet", async (req, res) => {
    try{
        var wallet = new Wallet({user: req.body.user, fund: req.body.fund, lastTransactions: req.body.lastTransactions, deleted: req.body.deleted, createdAt: req.body.createdAt, updatedAt: req.body.updatedAt});
        await wallet.save();
        res.setHeader('Location', '/wallet/'+wallet._id);
        return res.status(201).json(wallet);
    } catch(e){
        return res.status(400).json(e);
    }
}
);

//Listar Wallets
app.get("/wallet", (req, res) => {
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
app.put("/wallet/:id", async (req, res) => {
    try{
        var filter = { _id: req.params.id };
        Wallet.findOneAndUpdate(filter, req.body, function(err, doc) {
            if(!doc){
                return res.status(400).json("A wallet with that id could not be found.");
            }
        });
        var wallet = await Wallet.findOne(filter);
        if(wallet){
            return res.status(200).json(wallet);
        }else{
            return res.status(404).json("A wallet with that id could not be found.");
        }
    }catch(e){
        return res.status(500).json(e);
    }
});

//Obtener un Wallet
app.get("/wallet/:id", (req, res) => {
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
app.delete("/wallet/:id", (req, res) => {
    if(!ObjectId.isValid(req.params.id)){
        return res.status(400).json("A wallet with that id could not be found, since it's not a valid id.");
    }

    Wallet.findByIdAndDelete(req.params.id,function (err, wallet) {
        if (err){
             return res.status(500).json(err);
            }
        else if(wallet){
            return res.status(200).json();
        }else{
            return res.status(404).json("A wallet with that id could not be found.");
        }
    });
});

app.put("/wallet/:id/:fund", (req, res) => {
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

module.exports = app;