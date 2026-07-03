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

const updateExpense = async (userId, expenseId, expenseData) => {
  const expense = await Expense.findOneAndUpdate({ _id: expenseId, userId }, { amount: expenseData.amount, description: expenseData.description, category: expenseData.category, expenseDate: expenseData.expenseDate, paymentMode: expenseData.paymentMode, notes: expenseData.notes }, { new: true, runValidators: true });

  if (!expense) {
    throw new Error("Expense not found or you do not have permission to update this expense");
  }
  return expense;
};

const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOneAndDelete({ _id: expenseId, userId });

  if (!expense) {
    throw new Error("Expense not found or you do not have permission to delete this expense");
  }
  return expense;
};

export default { addExpense, getExpenses, updateExpense, deleteExpense };