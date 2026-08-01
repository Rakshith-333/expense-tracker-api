import express from "express";
const router = express.Router();

import profileController from "../controllers/profile.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { updateProfileValidation, updateMonthlyBudgetValidation } from "../validators/profile.validator.js";

router.get("/", authenticate, profileController.getProfile);
router.put("/", authenticate, updateProfileValidation, validate, profileController.updateProfile);
router.put("/budget", authenticate, updateMonthlyBudgetValidation, validate, profileController.updateMonthlyBudget);

export default router;
