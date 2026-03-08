import express from "express";
import { login, logout, verifyAuth } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest, loginSchema } from "../middleware/validateRequest.js";

const router = express.Router();

router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verifyAuth);

export default router;
