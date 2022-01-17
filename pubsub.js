const { PubSub } = require("@google-cloud/pubsub");
const dotenv = require('dotenv');

dotenv.config();

// Creo un onjeto de pubsub
const pubsub = new PubSub({      
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
});

// Defino una funcion para mandar un mensaje con un topic y con datos
 const publishPubSubMessage = async function (topicName, data) {
  const dataBuffer = Buffer.from(JSON.stringify(data));
  await pubsub.topic(topicName).publishMessage({
    data: dataBuffer,
  });
};

// Defino una funcion que crea topics
const createTopic = async function (topicName = "YOUR_TOPIC_NAME") {
  try {
    await pubsub.createTopic(topicName);
    console.log(`Topic ${topic.name} created.`);
  } catch (e) {
    throw new Error(e);
  }
};

// Defino una funcion para crear subscripciones
// Por ejemplo: createSubscription("created-user", "wallet-service");
// Resultado: wallet-service-created-user
const createSubscription = async function (
  topicName = "YOUR_TOPIC_NAME",
  subscriptionName = "YOUR_SUBSCRIPTION_NAME"
) {
  // Creates a new subscription
  try {
    await pubsub
      .topic(topicName)
      .createSubscription(subscriptionName + "-" + topicName);

    console.log(`Subscription ${subscriptionName} created.`);
  } catch (e) {}
};

module.exports = { pubsub, publishPubSubMessage, createTopic, createSubscription }; 