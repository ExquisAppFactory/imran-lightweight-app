import dotenv from "dotenv";
// Load env variables
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { UnauthorizedError } from "express-jwt";
import responseHelper from "express-response-helper";
import userRoutes from "./routes/user";

const app = express();

// Set up middleware
app.use(express.json());
app.use(responseHelper.helper());

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
  .catch(() => console.log("User Service failed to connect to the database"));

// Start up the server
const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`);
});
