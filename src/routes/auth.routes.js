import express from "express";
const router = express.Router();

import authController from "../controllers/auth.controller.js";
import validate from "../middleware/validation.middleware.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);

export default router;