import { Document, Schema, model } from "mongoose";
import { TimeStamps } from "./common";
import joi from "joi";

export interface IUser extends Document, TimeStamps {
  fullName: string;
  email: string;
  gender: string;
}

export interface IWallet extends Document, TimeStamps {
  user: IUser;
  balance: number;
}

const schema = new Schema<IWallet>(
  {
    user: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const validationRules = {
  create: joi.object({
    userId: joi.string().required(),
  }),
  update: joi.object({
    balance: joi.number().required(),
  }),
};

export const Wallet = model<IWallet>("Wallet", schema);
