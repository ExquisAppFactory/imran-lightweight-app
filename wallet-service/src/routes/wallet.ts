import { Router } from "express";
import { createWallet, getWallet, updateWallet } from "../controllers/wallet";

const router = Router();

router.post("/", createWallet);
router.get("/:userId", getWallet);
router.put("/:userId", updateWallet);

export default router;
