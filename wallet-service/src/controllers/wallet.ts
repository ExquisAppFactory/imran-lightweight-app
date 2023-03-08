import { Request } from "express";
import { Wallet, validationRules } from "../models/wallet";
import { withTransaction } from "../util/database";
import { validateRequest } from "../util/validation";
import { isValidObjectId } from "mongoose";

export const createWallet = async (req: Request, res: any, next: any) => {
  const handler = async () => {
    await withTransaction(next, async (session) => {
      const body = req.body;

      // Make sure user id is a valid mongo id
      if (!isValidObjectId(body.userId))
        return res.failValidationError(["Invalid user id"], "validation-error");

      // Duplicate errors
      const errors = [];

      let wallet = await Wallet.findOne({ user: body.userId });
      if (wallet) errors.push("This user has an existing wallet");

      if (errors.length > 0)
        return res.failValidationError(errors, "validation-error");

      // Extract the required data
      const data = {
        user: body.userId,
      };

      // Save the wallet
      wallet = new Wallet(data);
      await wallet.save({ session });

      res.respondCreated(null, "User wallet created");
    });
  };

  validateRequest(req, res, validationRules.create, handler);
};

export const getWallet = async (req: Request, res: any) => {
  const userId = req.params.userId;

  // Make sure user id is a valid mongo id
  if (!isValidObjectId(userId))
    return res.failValidationError(["Invalid user id"], "validation-error");

  // Get the wallet
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) return res.failNotFound("Wallet not created for this user id");

  return res.respond(wallet);
};

export const updateWallet = async (req: Request, res: any, next: any) => {
  const handler = async () => {
    await withTransaction(next, async (session) => {
      const userId = req.params.userId;

      // Make sure user id is a valid mongo id
      if (!isValidObjectId(userId))
        return res.failValidationError(["Invalid user id"], "validation-error");

      // Get the wallet
      const wallet = (await Wallet.findOne({ user: userId })) as any;
      if (!wallet)
        return res.failNotFound("Wallet not created for this user id");

      const body = req.body;
      const updatableFields = ["balance"];
      const fields = Object.keys(body);
      const updatedFields = updatableFields.filter(
        (field) => fields.indexOf(field) !== -1
      );

      updatedFields.forEach((field) => (wallet[field] = body[field]));

      await wallet.save({ session });
      res.respond(wallet);
    });
  };

  validateRequest(req, res, validationRules.update, handler);
};
