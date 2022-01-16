const Wallet = require('../models/walletModel');
const mongoose = require('mongoose');
const dbConnect = require('../db');

describe('Wallet DB connection', () => {
    beforeAll(() => {
        return dbConnect();
    });

    beforeEach((done) => {
        Wallet.deleteMany({}, (err) => {
            done();
        });
    });

    it('Writes a wallet in the DB', (done) => {
        const wallet2 = new Wallet({user: 'User_one', fund: 123.45, lastTransactions: [], deleted: false, createdAt: "12/12/21", updatedAt: "14/12/21"});
        wallet2.save((err,wallet) => {
            expect(err).toBeNull();
            Wallet.find({}, (err, wallets) => {
                expect(err).toBeNull();
                expect(wallets).toHaveLength(1);
                expect(wallets[0].user).toEqual(wallet2.user);
                expect(wallets[0].fund).toEqual(wallet2.fund);
                expect(wallets[0].lastTransactions).toEqual(wallet2.lastTransactions);
                expect(wallets[0].deleted).toEqual(wallet2.deleted);
                expect(wallets[0].createdAt).toEqual(wallet2.createdAt);
                expect(wallets[0].updatedAt).toEqual(wallet2.updatedAt);
                done();
            });
        });
    });
    afterAll((done) => {
        mongoose.connection.db.dropDatabase(()=> {
            mongoose.connection.close(done);
        });
    });
})