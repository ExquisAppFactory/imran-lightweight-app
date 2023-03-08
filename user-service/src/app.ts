import dotenv from "dotenv";
// Load env variables
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { UnauthorizedError } from "express-jwt";
import responseHelper from "express-response-helper";
import morgan from "morgan";
import amqp from "amqplib";

import userRoutes from "./routes/user";
import { RabbitMQHelper } from "./util/rabbitmq";

const app = express();
const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER!;
const DATABASE_URL = process.env.DATABASE_URL as string;

// Set up middleware
app.use(express.json());
app.use(responseHelper.helper());
app.use(morgan("combined"));

// Set up routes
app.get("/", (_req, res) => {
  res.send("User Service API");
});
app.use("/user", userRoutes);

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.log(err);

  if (err instanceof UnauthorizedError) {
    const unauthorized = err as UnauthorizedError;
    return res.failUnauthorized(unauthorized.message, "unauthorized");
  }

  return res.failServerError();
});

const connectRabbitMQ = () => {
  return amqp.connect(RABBITMQ_SERVER).then((connection) => {
    return connection.createChannel();
  });
};

// Connect to the database
mongoose
  .connect(DATABASE_URL)
  .then(async () => {
    // Connect to rabbitmq
    RabbitMQHelper.messageChannel = await connectRabbitMQ();

    // Start up the server
    const PORT = parseInt(process.env.PORT || "3000");
    app.listen(PORT, () => {
      console.log(`User Service started`);
    });
  })
  .catch((err) => console.log(`User Service failed start: ${err}`));
