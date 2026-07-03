import Expense from "../models/expense.model.js";

const addExpense = async (userId, expenseData) => {
  const expense = await Expense.create({ userId, amount: expenseData.amount, description: expenseData.description, category: expenseData.category, expenseDate: expenseData.expenseDate, paymentMode: expenseData.paymentMode, notes: expenseData.notes });
  return expense;
}

const getExpenses = async (userId, { page, limit, skip }) => {
  const skipValue = (page - 1) * limit;
  const expenses = await Expense.find({ userId }).sort({ expenseDate: -1, createdAt: -1 }).skip(skipValue).limit(limit);
  const totalExpenses = await Expense.countDocuments({ userId });
  return { expenses, pagination: { totalExpenses, currentPage: page, pageSize: limit, totalPages: Math.ceil(totalExpenses / limit) } };
}

export default { addExpense, getExpenses };