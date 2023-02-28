import { Request } from "express";
import { expressjwt } from "express-jwt";
import { User, validationRules } from "../models/user";
import { withTransaction } from "../util/database";
import randomString from "random-string";
import { hashString } from "../util/utils";
import { validateRequest } from "../util/validation";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

export const authenticateUser = async (req: Request, res: any) => {
  // check Basic auth header
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  )
    return res.failUnauthorized("Missing Authorization Header");

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  let user = null;

  // check email
  user = await User.findOne({ email: username });

  // At this point, if user is still undefined then this user doesn't exist
  if (!user)
    return res.failUnauthorized(
      "Invalid email or password",
      "invalid-credentials"
    );

  // validate password
  if (await bcrypt.compare(password, user.password)) {
    // Credentials are valid.
    // Create fresh tokens for the client
    const access_token = jwt.sign(
      { id: user.idToken },
      process.env.TOKEN_SECRET!,
      {
        expiresIn: process.env.TOKEN_EXPIRY!,
        algorithm: "HS256",
      }
    );
    const refresh_token = jwt.sign(
      { refreshId: user.idToken },
      process.env.TOKEN_SECRET!,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY!,
        algorithm: "HS256",
      }
    );

    const data = {
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenType: "Bearer",
      accessTokenExpiresIn: process.env.TOKEN_EXPIRY!,
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRY!,
    };

    return res.respond(data);
  } else {
    return res.failUnauthorized("Invalid username, email or password");
  }
};

export const getNewTokens = async (req: Request, res: any) => {
  // Fetch the id token
  const idToken = req.auth.refreshId;

  if (!idToken) return res.failUnauthorized("Unauthorized", "invalid_token");

  // Fetch the user
  const user = await User.findOne({
    idToken: idToken,
  });

  if (!user) return res.failUnauthorized("Unauthorized", "invalid_token");

  // Generate new tokens
  const access_token = jwt.sign(
    { id: user.idToken },
    process.env.TOKEN_SECRET!,
    {
      expiresIn: process.env.TOKEN_EXPIRY!,
      algorithm: "HS256",
    }
  );
  const refresh_token = jwt.sign(
    { refreshId: user.idToken },
    process.env.TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY!,
      algorithm: "HS256",
    }
  );

  const data = {
    accessToken: access_token,
    refreshToken: refresh_token,
    tokenType: "Bearer",
    accessTokenExpiresIn: process.env.TOKEN_EXPIRY,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  };

  return res.respond(data);
};

export const postAuthentication = async (req: Request, res: any, next: any) => {
  // Fetch the id token
  const idToken = req.auth.id;

  if (!idToken) return res.failUnauthorized();

  // Fetch the user
  const user = await User.findOne(
    { idToken: idToken },
    { password: 0, idToken: 0 }
  );

  if (!user) return res.failUnauthorized();

  req.user = user;
  next();
};

export const getUserData = async (req: Request, res: any) => {
  return res.respond(req.user);
};
