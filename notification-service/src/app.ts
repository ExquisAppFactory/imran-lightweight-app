import dotenv from "dotenv";
// Load env variables
dotenv.config();

import amqp, { Channel, ConsumeMessage } from "amqplib";

const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER!;

const connectRabbitMQ = () => {
  return amqp.connect(RABBITMQ_SERVER).then((connection) => {
    return connection.createChannel();
  });
};

const setupHandlers = (messageChannel: Channel) => {
  const consumeNotificationMessage = (message: ConsumeMessage | null) => {
    if (!message) return;

    const parsedMsg = JSON.parse(message.content.toString());
    console.log(`Notification service consumed: ${JSON.stringify(parsedMsg)}`);
  };

  return messageChannel.assertQueue("notifications", {}).then(() => {
    return messageChannel.consume("notifications", consumeNotificationMessage);
  });
};

const run = () => {
  return connectRabbitMQ().then((messageChannel) => {
    return setupHandlers(messageChannel);
  });
};

run()
  .then(() => console.log("Notification service started"))
  .catch((err) => {
    console.error("Notification service failed to start.");
    console.error((err && err.stack) || err);
  });
