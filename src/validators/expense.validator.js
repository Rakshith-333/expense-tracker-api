import {body} from "express-validator";

const addExpenseValidation = [
    body("amount").notEmpty().withMessage("Amount is required").isFloat({ gt: 0 }).withMessage("Amount must be a greater than 0"),
    body("description").optional().trim().isLength({ max: 200 }).withMessage("Description must be less than 200 characters"),
    body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
    body("category").notEmpty().withMessage("Category is required").isIn(["Food", "Transport", "Entertainment", "Utilities", "Health", "Other"]).withMessage("Invalid category"),
    body("expenseDate").notEmpty().withMessage("Expense date is required").isISO8601().withMessage("Invalid expense date"),
    body("paymentMode").notEmpty().withMessage("Payment mode is required").isIn(["Cash", "Credit Card", "Debit Card", "Online Payment", "UPI", "Other"]).withMessage("Invalid payment mode")
];

export { addExpenseValidation };