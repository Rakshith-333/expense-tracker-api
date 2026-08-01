import { body } from "express-validator";

export const updateMonthlyBudgetValidation = [
  body("monthlyBudget")
    .exists({ checkFalsy: false })
    .withMessage("monthlyBudget is required")
    .isNumeric()
    .withMessage("monthlyBudget must be a number")
    .custom((value) => Number(value) >= 0)
    .withMessage("monthlyBudget must be a non-negative number"),
];
