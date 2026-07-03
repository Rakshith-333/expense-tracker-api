import express from "express";
const router = express.Router();

import expenseController from "../controllers/expense.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { addExpenseValidation } from "../validators/expense.validator.js";  

router.post("/", authenticate, addExpenseValidation, validate, expenseController.addExpense);
router.get("/", authenticate, expenseController.getExpenses);

export default router;