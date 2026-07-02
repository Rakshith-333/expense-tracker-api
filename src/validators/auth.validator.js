import { body } from "express-validator";

export const registerValidation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

export const loginValidation = [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
];