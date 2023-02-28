import mongoose, { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { IUser } from "./user";

export interface IPendingVerification extends Document, TimeStamps {
  verificationType: "PASSWORD_RESET" | "OTHER";
  verificationCode: string;
  user: IUser;
  additionalData: any;
}

const schema = new Schema<IPendingVerification>(
  {
    verificationType: {
      type: String,
      enum: ["PASSWORD_RESET", "OTHER"],
      default: "OTHER",
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    additionalData: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

export const PendingVerification = mongoose.model<IPendingVerification>(
  "PendingVerification",
  schema,
  "pending_verifications"
);
