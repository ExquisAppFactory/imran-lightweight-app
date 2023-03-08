import dotenv from "dotenv";
// Load env variables
dotenv.config();

import amqp from "amqplib";

const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER!;

const connectRabbitMQ = () => {
  return amqp.connect(RABBITMQ_SERVER).then((connection) => {
    return connection.createChannel();
  });
};

const run = () => {
  return connectRabbitMQ().then((messageChannel) => {
    console.log("Message channel created");
  });
};

run()
  .then(() => console.log("Notification service started"))
  .catch((err) => {
    console.error("Notification service failed to start.");
    console.error((err && err.stack) || err);
  });
