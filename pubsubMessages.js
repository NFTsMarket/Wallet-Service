const { response } = require("express");
const { publishPubSubMessage } = require("./pubsub");

createTopic('created-wallet')
createTopic('updated-wallet')
createTopic('deleted-wallet')

const sendMessageCreatedWallet = async (req, res = response) => {
    try {
        await publishPubSubMessage("created-wallet", req);

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
};

const sendMessageUpdatedWallet = async (req, res = response) => {
    try {
        await publishPubSubMessage("updated-wallet", req);

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
};

const sendMessageDeletedWallet = async (req, res = response) => {
    try {
        await publishPubSubMessage("deleted-wallet", req);

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
};

module.exports = { sendMessageCreatedWallet, sendMessageUpdatedWallet, sendMessageDeletedWallet };