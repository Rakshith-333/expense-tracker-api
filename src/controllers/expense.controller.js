import expenseService from "../services/expense.service.js";

const addExpense = async (req, res) => {
    try {
        const result = await expenseService.addExpense(req.user.userId, req.body);
        return res.status(201).json({ success: true, message: "Expense added successfully", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getExpenses = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const result = await expenseService.getExpenses(req.user.userId, { page, limit, skip });
        return res.status(200).json({ success: true, message: "Expenses retrieved successfully", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export default { addExpense, getExpenses };