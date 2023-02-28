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
    fullName: joi.string().max(100),
    currentPassword: joi.string(),
    password: joi.string().min(6),
    confirmPassword: joi.string().valid(joi.ref("password")),
    gender: joi.string().valid("Male", "Female"),
  }),
  initiatePasswordReset: joi.object({
    email: joi.string().email().max(50).required(),
  }),
  finalizePasswordReset: joi.object({
    newPassword: joi.string().min(6).required(),
    confirmPassword: joi.string().required().valid(joi.ref("newPassword")),
    verificationCode: joi.string().required(),
  }),
};

export const User = model<IUser>("User", schema);
