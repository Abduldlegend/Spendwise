import express from "express";

import { authController } from "../../controllers/auth.controller.js";
import { authValidators } from "../../validators/auth.validator.js";
import { validate } from "../../middleware/validate.js";
import { authLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, validate(authValidators.register), authController.register);
router.post("/login", authLimiter, validate(authValidators.login), authController.login);
router.post("/google", authLimiter, validate(authValidators.google), authController.google);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
