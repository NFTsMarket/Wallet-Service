var Wallet = require('../models/walletModel.js')
const app = require("../server.js");
const request = require("supertest");
const authorizeToken = require("../middlewares/authorized-roles");
const jwt = require("jsonwebtoken");
var ObjectId = require('mongoose').Types.ObjectId;

const dotenv = require('dotenv');
dotenv.config();

describe("Wallet service API", () => {
    let adminToken;
    let clientToken;
    beforeAll(() => {
        process.env.SECRET_KEY = "secret_key";
        adminToken = jwt.sign({ "id": "a", "email": "david@gmail.com", "role": "admin" }, process.env.SECRET_KEY);
        clientToken = jwt.sign({ "id": "b", "email": "david2@gmail.com", "role": "client" }, process.env.SECRET_KEY);
    })


    describe("GET /wallet", () => {
        var dbFind;
        beforeAll(() => {
            const wallets = [
                { _doc: { _id: "a", user: "joe", fund: 12.63, lastTransactions: [], deleted: false, createdAt: "06/23/2021", updatedAt: "07/23/2021" } },
                { _doc: { _id: "b", user: "gideon", fund: 16.98, lastTransactions: [13.20, 14.00], deleted: true, createdAt: "12/29/2021", updatedAt: "12/30/2021" } },
                { _doc: { _id: "c", user: "max", fund: 13.73, lastTransactions: [1.12], deleted: true, createdAt: "01/29/2021", updatedAt: "01/29/2021" } }
            ]

            dbFind = jest.spyOn(Wallet, "find");
            dbFind.mockImplementation(({ }, query, { }, callback) => {
                callback(null, wallets)
            });

        })

        it("Should return all wallets in DB", () => {

            return request(app).get("/api/v1/wallet").set("Authorization", `Bearer ` + adminToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(3);
            })
        })

        it("Should return 403 Forbidden", () => {

            return request(app).get("/api/v1/wallet").set("Authorization", `Bearer ` + clientToken).then((response) => {
                expect(response.statusCode).toBe(403);
            })
        })
    })

    describe("GET /wallet/:id", () => {

        var dbFind;
        var validId;
        var wallet;
        beforeAll(() => {
            wallet = { _doc: { _id: "61c5c8475a8d4de2b1939301", user: "joe", fund: 12.63, lastTransactions: [], deleted: false, createdAt: "06/23/2021", updatedAt: "07/23/2021" } };

            validId = jest.spyOn(ObjectId, "isValid");
            dbFind = jest.spyOn(Wallet, "findOne");


        })

        it("Should return one wallet in DB", () => {
            validId.mockImplementation(() => {
                return true
            })
            dbFind.mockImplementation((query, callback) => {
                callback(null, wallet)
            });
            return request(app).get("/api/v1/wallet/61c5c8475a8d4de2b1939301").set("Authorization", `Bearer ` + clientToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body._doc.user).toEqual("joe");
            })
        })
        it("Should return 400 Bad Request", () => {
            validId.mockImplementation(() => {
                return false
            })
            dbFind.mockImplementation((query, callback) => {
                callback(null, null)
            });
            return request(app).get("/api/v1/wallet/123").set("Authorization", `Bearer ` + clientToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toBe("A wallet with that id could not be found, since it's not a valid id.");
            })
        })
        it("Should return 500 Internal Server Error", () => {
            validId.mockImplementation(() => {
                return true
            })
            dbFind.mockImplementation((query, callback) => {
                callback(true, null)
            });
            return request(app).get("/api/v1/wallet/61c5c8475a8d4de2b1939301").set("Authorization", `Bearer ` + clientToken).then((response) => {
                expect(response.statusCode).toBe(500);
            })
        })
        it("Should return 404 Not Found", () => {
            validId.mockImplementation(() => {
                return true
            })
            dbFind.mockImplementation((query, callback) => {
                callback(null, null)
            });
            return request(app).get("/api/v1/wallet/61c5c8475a8d4de2b1939302").set("Authorization", `Bearer ` + clientToken).then((response) => {
                expect(response.statusCode).toBe(404);
                expect(response.body).toBe("A wallet with that id could not be found.");
            })
        })
    })
    describe("POST /wallet/", () => {
        let wallet;
        let dbInsert;
        beforeEach(() => {
            wallet = { user: "joe", fund: 12.635, lastTransactions: [], deleted: false, createdAt: "06/23/2021", updatedAt: "07/23/2021" };
            dbInsert = jest.spyOn(Wallet, "create");
        })
        it('Should add a new wallet if everything is fine', () => {
            dbInsert.mockImplementation((c, callback) => {
                callback(false);
            });

            return request(app).post('/api/v1/wallet').set("Authorization", `Bearer ` + adminToken).send(wallet).then((response) => {
                expect(response.statusCode).toBe(201);
            });
        })
        it('Should return 403 Forbidden', () => {
            dbInsert.mockImplementation((c, callback) => {
                callback(false);
            });

            return request(app).post('/api/v1/wallet').set("Authorization", `Bearer ` + clientToken).send(wallet).then((response) => {
                expect(response.statusCode).toBe(403);
            });
        })
    })
    describe("PUT /wallet/:id", () => {
        var wallet;
        var dbInsert;
        var validId;
        var dbFind;
        beforeEach(() => {
            wallet = { _doc: { _id: "61c5c8475a8d4de2b1939301", user: "joe", fund: 12.63, lastTransactions: [], deleted: false, createdAt: "06/23/2021", updatedAt: "07/23/2021" } };
            updatedWallet = {_doc: { _id: "61c5c8475a8d4de2b1939301", user: "gideon", fund: 12.63, lastTransactions: [], deleted: false, createdAt: "06/23/2021", updatedAt: "07/23/2021" } };
            validId = jest.spyOn(ObjectId, "isValid");
            dbFind = jest.spyOn(Wallet, "findOne");
            dbUpdate = jest.spyOn(Wallet, "findOneAndUpdate");
    })
    it('Should add a new wallet if everything is fine', () => {
        dbUpdate.mockImplementation((f, update, v, callback) => {
            callback(null, true);
          });

        return request(app).put('/api/v1/wallet/61c5c8475a8d4de2b1939301').set("Authorization", `Bearer ` + adminToken).send(updatedWallet).then((response) => {
            expect(response.statusCode).toBe(200);
        });
    })
})
})