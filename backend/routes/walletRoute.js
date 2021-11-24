module.exports = function (app) {
    var Wallet = require('../models/walletModel.js');
    
    wallet = function (req, res) {
        var wallet = new Wallet({user: req.body.user, found: req.body.found, deleted: req.body.deleted, createdAt: req.body.createdAt, updatedAt: req.body.updatedAt});
        wallet.save();
        res.end();
    };

    allWallet = function (req, res) {
        Wallet.find(function (err, wallet) {
            res.send(wallet);
        });
    };

    oneWallet = (function (req, res) {
        Wallet.findOne({ _id: req.params.id }, function (error, wallet) {
            res.send(wallet);
        })
    })


    app.post('/wallet', wallet);
    app.get('/wallet', allWallet);
    app.get('/wallet/:id', oneWallet);
}