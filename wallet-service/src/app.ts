import dotenv from "dotenv";
// Load env variables
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import responseHelper from "express-response-helper";
import morgan from "morgan";
import walletRoutes from "./routes/wallet";

const app = express();

// Set up middleware
app.use(express.json());
app.use(responseHelper.helper());
app.use(morgan("combined"));

// Set up routes
app.get("/", (_req, res) => {
  res.send("Wallet Service API");
});
app.use("/wallet", walletRoutes);

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.log(err);

  return res.failServerError();
});

// Connect to the database
const DATABASE_URL = process.env.DATABASE_URL as string;
mongoose
  .connect(DATABASE_URL)
  .then(() => {
    // Start up the server
    const PORT = parseInt(process.env.PORT || "3001");
    app.listen(PORT, () => {
      console.log(`Wallet Service started`);
    });
  })
  .catch((err) =>
    console.log(`Wallet Service failed to connect to the database: ${err}`)
  );
