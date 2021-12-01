module.exports = function (app) {
    var Wallet = require('../models/walletModel.js');
    
    wallet = function (req, res) {
        var wallet = new Wallet({user: req.body.user, fund: req.body.fund, lastTransactions: req.body.lastTransactions, deleted: req.body.deleted, createdAt: req.body.createdAt, updatedAt: req.body.updatedAt});
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

    deleteWallet = function(req, res) {
        Wallet.deleteOne({ _id: req.params.id }, function (error) {
            if (error) {
                res.send(error);
            } else {
                res.send("Your wallet was deleted");
            }
        })
    }

    updateWallet = function(req, res) {
        Wallet.findOneAndUpdate(
            { _id: req.params.id }, 
            {
                user: req.body.user, 
                fund: req.body.fund,
                lastTransactions: req.body.lastTransactions,
                deleted: req.body.deleted, 
                createdAt: req.body.createdAt, 
                updatedAt: req.body.updatedAt
            }, {returnOriginal:false},
            function (error, wallet) {
                if (error) {
                    res.send(error);
                } else {
                    return res.send('Succesfully saved.');
                }
            }
        )
    }
    
    app.post('/wallet', wallet);
    app.get('/wallet', allWallet);
    app.get('/wallet/:id', oneWallet);
    app.delete('/wallet/:id', deleteWallet);
    app.put('/wallet/:id', updateWallet);
}