import dotenv from "dotenv";
// Load env variables
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { UnauthorizedError } from "express-jwt";
import responseHelper from "express-response-helper";
import morgan from "morgan";
import userRoutes from "./routes/user";

const app = express();

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

// Connect to the database
const DATABASE_URL = process.env.DATABASE_URL as string;
mongoose
  .connect(DATABASE_URL)
  .then(() => {
    // Start up the server
    const PORT = parseInt(process.env.PORT || "3000");
    app.listen(PORT, () => {
      console.log(`User Service started`);
    });
  })
  .catch((err) =>
    console.log(`User Service failed to connect to the database: ${err}`)
  );
