import { Document, Schema, model } from "mongoose";
import { TimeStamps } from "./common";
import joi from "joi";

export interface IUser extends Document, TimeStamps {
  idToken: string;
  fullName: string;
  email: string;
  gender: string;
  password: string;
}

const schema = new Schema<IUser>(
  {
    idToken: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male",
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const validationRules = {
  create: joi.object({
    email: joi.string().email().max(50).required(),
    password: joi.string().min(6).required(),
  }),
  update: joi.object({
    email: joi.string().email().max(50),
    full_name: joi.string().max(100),
    phone: joi.string().min(11).max(15),
    current_password: joi.string(),
    password: joi.string().min(6),
    confirm_password: joi.string().valid(joi.ref("password")),
    gender: joi.string().valid("Male", "Female"),
  }),
};

export const User = model<IUser>("user", schema);
