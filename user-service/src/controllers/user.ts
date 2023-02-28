import { Request } from "express";
import { expressjwt } from "express-jwt";
import { User, validationRules } from "../models/user";
import { withTransaction } from "../util/database";
import randomString from "random-string";
import { hashString } from "../util/utils";
import { validateRequest } from "../util/validation";

export const checkJwt = expressjwt({
  secret: process.env.TOKEN_SECRET as string,
  requestProperty: "auth",
  algorithms: ["HS256"],
});

export const getAccountAvailability = async (req: Request, res: any) => {
  const body = req.body;

  if (!body.email) return res.failNotFound("No input provided");

  const feedbacks = [];

  if (body.email && (await User.findOne({ email: body.email })))
    feedbacks.push("Email is registered");

  if (feedbacks.length === 0) return res.respond("Account available");

  return res.failValidationError(feedbacks, "account-not-available");
};

export const createUser = async (req: Request, res: any, next: any) => {
  const handler = async () => {
    await withTransaction(next, async (session) => {
      const body = req.body;

      // Duplicate errors
      const errors = [];

      let user = await User.findOne({ email: body.email });
      if (user) errors.push("This email address is already registered");

      if (errors.length > 0)
        return res.failValidationError(errors, "validation-error");

      // Extract the required data
      const data = {
        email: body.email,
        idToken: await hashString(randomString({ length: 128 })),
        password: await hashString(body.password),
      };

      // Save the user
      user = new User(data);
      await user.save({ session });

      res.respondCreated(null, "User account created");
    });
  };

  validateRequest(req, res, validationRules.create, handler);
};
