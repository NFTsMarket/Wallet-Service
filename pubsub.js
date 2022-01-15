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

/*// Creo un onjeto de pubsub
const pubsub = new PubSub({      
  projectId: "archis-market",
  credentials: {
    client_email: "pubsub-admin@archis-market.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3QZCBWdgE5QOI\nUQqrJxZidu+qAlKlF3CCFNptgUfU4ex9RErN0VSi6yQ4dRmpJF2QrMFgfHHvv52B\nrK8O1/65b4DIUxdGVRDaGrkkhDquLZ68ZtJDjnGoKCiT0+hRQ0xA86/7g1CCOrCU\nwsbNYraT+VEgIHTTqw5CjncFKAt2V6dKSYTpD2M3iGcVXVNKPaGt3eGKGQDsuZep\nZCMAkgIYGINlDchStFm9GdgwlBsWek7lOl+tR7zOtsa8LoDOlGokkb3XdD0dlGxP\nkl+pBt7QFGdDdoCRP8ipCHIqBBGcT5zW1tnN8BCAMaxvRPxwKBzFbA54o8PQxgbW\nioXBXTIJAgMBAAECggEAVHAEWmWAUHkJUKUuyj/fY40zztz1IZaUQ4vCPVSlOWTD\n59Awu3bpjYvVC6KBKVtVNVU0YPXWNcbPlzFvE+LYPq8u4p7OiZymgChyCG5Y72qb\nymmCFpiqq/WdBMhOMitVFlRyUOxniynptRGuMnJ6d+IXzDrIOcOGdYpZMuoJpgPj\nNlSLJyDc7X8aNbWRe30ZbcTFKevxhUKs92tIKbHgxTG6CBLsNfdyRJTOKoMNnZoQ\nAxy/mwqeZu+PMh4/ZWWBwN7qXCSyBwiU1SiBV71pOohxbJ9vwBlOmzklfggF0CFo\nRFmam3cvdwSIK4hDFmzk9gaWJ6ZF36YmiwLGh5C9pQKBgQDousP8IKOEqTkj+aOo\nYJw1qM8xuKryIzzycy8P3giEZeUdb9OlcW110ZYXc8clIC1F0WpD5pX/fWkREclo\nyBxObF/AVfrI/41x3dqBh6akxHiWvxETAp0A+608/ODhfZE9qPPdkQY+yusVcEBe\nbvuKHEu+bYirKs/PheExUYpBhwKBgQDJlGpRITu1ECuS2/mhReWBu2+HGBCc+y5p\nW8/n5iZ8IrZMyhfXeNxF8mxfpgty1SFr0LStWzrCnrJLxhrIY500jCGVgn/wAx0u\ns+aGRjaitgeINetuZFTy9aoT7OgD5A0IXI6qtSmL3g2m+dwl53hRSkGrtdnQV8wq\nTO227WsT7wKBgQCxTcCMMC2DnwzaXJETcW7w7ofToJYT3UbMi3ZaR1UD0UFJOO3s\niErVTPRlL56TqTz0iQPFcUHroJbQG1Xvjy0JjkUwmhBy20bebh/PORJ7Svd4GV6f\ntgj5O8SSxzFoeSqS6EnKDnfMlPmenqNbjn/yi3YlQPuzM+2Yc63Jzg5ftwKBgBKk\nfDSmmywCo9UALRUCLtiRqh3XVun9vOwXhqHOwi5m029EnXHbBpwdcHJkG9jx5xZe\nhecmcce//4NMffucYtSSRSTbndNnplJEZwRyB+mCZi3ttqlN9CFIIQOYvFhnxeDJ\nFpSpDn+V+LNBll+XCaSS9oHX3p4LEKG03aM2T9nXAoGBALvGDFOGPOhItqXtfV+c\n960Xk0uUBy/D8LR9FiKbZmx+PwVbioHQwHqhrrYg33yd62DNaqN2ugw81OUCkgt4\n/wS1f8D6Oemhp7bT1XogKH16zL6KSrm29EXkqcU/0hr2r9ho1ESoKHB0VH0BBRpD\nQ30r7ICK1a+dkusI3U+DDAGD\n-----END PRIVATE KEY-----\n",
  },
});*/

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