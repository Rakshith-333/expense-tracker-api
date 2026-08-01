import { body } from "express-validator";

export const updateProfileValidation = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("name must be at least 2 characters long"),
  body("mobileNumber")
    .exists({ checkFalsy: true })
    .withMessage("mobileNumber is required")
    .isString()
    .withMessage("mobileNumber must be a string")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("mobileNumber must be between 10 and 15 characters"),
];

export const updateMonthlyBudgetValidation = [
  body("monthlyBudget")
    .exists({ checkFalsy: false })
    .withMessage("monthlyBudget is required")
    .isNumeric()
    .withMessage("monthlyBudget must be a number")
    .custom((value) => Number(value) >= 0)
    .withMessage("monthlyBudget must be a non-negative number"),
];
