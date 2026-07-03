import Expense from "../models/expense.model.js";
import mongoose from "mongoose";

const getSummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Current UTC date
  const now = new Date();

  // Start of today (UTC)
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  // Start of tomorrow (UTC)
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // First day of current month (UTC)
  const firstDayOfMonth = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    )
  );

  // First day of current week (Monday - UTC)
  const firstDayOfWeek = new Date(today);
  const day = firstDayOfWeek.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  firstDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() - diff);

  console.log("Today:", today.toISOString());
  console.log("Tomorrow:", tomorrow.toISOString());
  console.log("First Day Of Week:", firstDayOfWeek.toISOString());
  console.log("First Day Of Month:", firstDayOfMonth.toISOString());

  // Total This Month
  const totalThisMonth = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: firstDayOfMonth,
          $lt: tomorrow,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  // Today's Expenses
  const todaysExpenses = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: today,
          $lt: tomorrow,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  // Today's Transactions
  const todaysTransactions = await Expense.countDocuments({
    userId: userObjectId,
    expenseDate: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  // This Week's Expenses
  const thisWeeksExpenses = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: firstDayOfWeek,
          $lt: tomorrow,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  // This Month's Transactions
  const thisMonthsTransactions = await Expense.countDocuments({
    userId: userObjectId,
    expenseDate: {
      $gte: firstDayOfMonth,
      $lt: tomorrow,
    },
  });

  return {
    totalThisMonth: totalThisMonth[0]?.totalAmount || 0,
    todaysExpenses: todaysExpenses[0]?.totalAmount || 0,
    todaysTransactions,
    thisWeeksExpenses: thisWeeksExpenses[0]?.totalAmount || 0,
    thisMonthsTransactions,
  };
};

export default { getSummary };