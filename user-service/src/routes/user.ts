import { Router } from "express";
import {
  checkJwt,
  createUser,
  getAccountAvailability,
} from "../controllers/user";

const router = Router();

router.post("/", createUser);
router.post("/availability", getAccountAvailability);

// Validate access/refresh token
router.use(checkJwt);

// Protected routes

export default router;
