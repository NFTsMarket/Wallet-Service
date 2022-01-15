const  { createSubscription, publishPubSubMessage, createTopic } = require("./pubsub");

/*createTopic('created-wallet');
createTopic('updated-wallet');
createTopic('deleted-wallet');

createSubscription('created-user', 'wallet');
createSubscription('deleted-user', 'wallet');
createSubscription('created-purchase', 'wallet');*/

const sendMessageCreatedWallet = async (data) => {
    try {
        await publishPubSubMessage("created-wallet", data);

    } catch (e) {
        console.log(e);
    }
};

const sendMessageUpdatedWallet = async (data) => {
    try {
        await publishPubSubMessage("updated-wallet", data);

    } catch (e) {
        console.log(e);
    }
};

const sendMessageDeletedWallet = async (data) => {
    try {
        await publishPubSubMessage("deleted-wallet", data);

    } catch (e) {
        console.log(e);
    }
};

module.exports = { sendMessageCreatedWallet, sendMessageUpdatedWallet, sendMessageDeletedWallet };