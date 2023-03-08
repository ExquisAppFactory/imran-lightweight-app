import dotenv from "dotenv";
// Load env variables
dotenv.config();

import amqp, { Channel, ConsumeMessage } from "amqplib";
import { Email } from "./lib/email";
import { NotificationBody } from "./lib/types";

const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER!;

const connectRabbitMQ = () => {
  return amqp.connect(RABBITMQ_SERVER).then((connection) => {
    return connection.createChannel();
  });
};

const setupHandlers = (messageChannel: Channel) => {
  const email = new Email();

  const consumeNotificationMessage = async (message: ConsumeMessage | null) => {
    if (!message) return;

    try {
      const parsedMsg = JSON.parse(
        message.content.toString()
      ) as NotificationBody;

      await email.sendMail(parsedMsg.to, parsedMsg.subject, parsedMsg.body);
    } catch (err) {
      console.log(`Failed to dispatch notification: ${err}`);
    }
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
