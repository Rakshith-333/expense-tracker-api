import expenseService from "../services/expense.service.js";

const addExpense = async (req, res) => {
    try {
        const result = await expenseService.addExpense(req.user.userId, req.body);
        return res.status(201).json({ success: true, message: "Expense added successfully", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


export default { addExpense };