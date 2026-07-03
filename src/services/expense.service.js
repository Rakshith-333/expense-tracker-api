import Expense from "../models/expense.model.js";

const addExpense = async (userId, expenseData) => {
  const expense = await Expense.create({ userId, amount: expenseData.amount, description: expenseData.description, category: expenseData.category, expenseDate: expenseData.expenseDate, paymentMode: expenseData.paymentMode, notes: expenseData.notes });
  return expense;
}

export default { addExpense };