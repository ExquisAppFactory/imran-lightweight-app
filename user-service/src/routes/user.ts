import { Router } from "express";
import {
  authenticateUser,
  checkJwt,
  createUser,
  finalizePasswordReset,
  getAccountAvailability,
  getNewTokens,
  getUserData,
  initiatePasswordReset,
  postAuthentication,
} from "../controllers/user";

const router = Router();

router.post("/", createUser);
router.post("/availability", getAccountAvailability);
router.get("/authenticate", authenticateUser);
router.post("/password_reset/init", initiatePasswordReset);
router.post("/password_reset/finalize", finalizePasswordReset);

// Validate access/refresh token
router.use(checkJwt);

// Protected routes
router.get("/token", getNewTokens);
router.use(postAuthentication);
router.get("/", getUserData);

export default router;
