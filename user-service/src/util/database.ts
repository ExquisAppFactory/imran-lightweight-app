import mongoose from "mongoose";
import { Request } from "express";

export const withTransaction = async (
  next: any,
  handler: (session: mongoose.ClientSession) => Promise<void>,
  onCommit: () => Promise<void> = () => Promise.resolve()
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await handler(session);
    await session.commitTransaction();
    onCommit();
  } catch (err: any) {
    await session.abortTransaction();
    next(err);
  }

  session.endSession();
};

export const extractUpdatableModelFieldsFromRequest = (
  req: Request,
  updatableModelPath: any,
  updatableFields: string[]
): string[] => {
  const body = req.body;
  const fields = Object.keys(body);
  const updatedFields = updatableFields.filter(
    (field) => fields.indexOf(field) !== -1
  );

  updatedFields.forEach((field) => (updatableModelPath[field] = body[field]));
  return updatedFields;
};
