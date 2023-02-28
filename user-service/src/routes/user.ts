import { Router } from "express";
import {
  authenticateUser,
  checkJwt,
  createUser,
  getAccountAvailability,
  getNewTokens,
  getUserData,
  postAuthentication,
} from "../controllers/user";

const router = Router();

router.post("/", createUser);
router.post("/availability", getAccountAvailability);
router.get("/authenticate", authenticateUser);

// Validate access/refresh token
router.use(checkJwt);

// Protected routes
router.get("/token", getNewTokens);
router.use(postAuthentication);
router.get("/", getUserData);

export default router;
