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

  const firstDayOfPreviousMonth = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1,
      1
    )
  );

  const lastDayOfPreviousMonth = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    )
  );

  // First day of current week (Monday - UTC)
  const firstDayOfWeek = new Date(today);
  const firstDayOfPreviousWeek = new Date(firstDayOfWeek);
  firstDayOfPreviousWeek.setUTCDate(firstDayOfPreviousWeek.getUTCDate() - 7);

  const lastDayOfPreviousWeek = new Date(firstDayOfWeek);

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

  const PreviousMonthExpenses = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: firstDayOfPreviousMonth,
          $lt: lastDayOfPreviousMonth,
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

  const previousWeeksExpenses = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: firstDayOfPreviousWeek,
          $lt: lastDayOfPreviousWeek,
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

  const getPercentageChange = (current, previous) => {
    if (previous === 0) {
        return { percentage: 0, trend: "neutral" };
    }

    const perccentage = math.round(((current - previous) / previous) * 100);
    return {
        percentage: Math.abs(perccentage),
        trend: perccentage > 0 ? "up" : "down"
    };
  }

  const currentMonth = totalThisMonth[0]?.totalAmount || 0;
  const previousMonth = PreviousMonthExpenses[0]?.totalAmount || 0;

  const currentweek = thisWeeksExpenses[0]?.totalAmount || 0;
  const previousweek = previousWeeksExpenses[0]?.totalAmount || 0;

  const monthcomparison = getPercentageChange(currentMonth, previousMonth);
  const weekcomparison = getPercentageChange(currentweek, previousweek);

  return {
    totalThisMonth: { amount: currentMonth, percentage: monthcomparison.percentage, trend: monthcomparison.trend },
    todaysExpenses: todaysExpenses[0]?.totalAmount || 0,
    todaysTransactions,
    thisWeeksExpenses: { amount: currentweek, percentage: weekcomparison.percentage, trend: weekcomparison.trend },
    thisMonthsTransactions,
    // PreviousMonthExpenses: PreviousMonthExpenses[0]?.totalAmount || 0,
    // previousWeeksExpenses: previousWeeksExpenses[0]?.totalAmount || 0,
  };
};

const getCategorySummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const now = new Date();

  // Start of month (UTC)
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  // Start of next month (UTC)
  const endOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );

  const categorySummary = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      },
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
  ]);

  const totalExpenses = categorySummary.reduce(
    (acc, curr) => acc + curr.totalAmount,
    0
  );

  return categorySummary.map((category) => ({
    category: category._id,
    totalAmount: category.totalAmount,
    percentage:
      totalExpenses > 0
        ? Math.round((category.totalAmount / totalExpenses) * 100)
        : 0,
  }));
};

const getRecentExpenses = async (userId) => {
    return await Expense.find({ userId }).sort({ expenseDate: -1, createdAt: -1 }).limit(5).select("category amount description expenseDate paymentMode");
};

const getMonthlyTrend = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const currentYear = new Date().getFullYear();

  const results = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$expenseDate" },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyTrend = months.map((month, index) => {
    const monthData = results.find((result) => result._id === index + 1);
    return {
      month,
      totalAmount: monthData ? monthData.totalAmount : 0,
    };
  });

  return monthlyTrend;
};

const getTopCategories = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalExpenseResult = await Expense.aggregate([
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
        totalExpense: { $sum: "$amount" },
      },
    },
  ]);

  const totalExpense = totalExpenseResult[0]?.totalExpense || 0;

  const result = await Expense.aggregate([
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
        _id: "$category",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
    {
      $limit: 1, // Get the top category
    },
  ]);

  if (result.length === 0) {
    return { category: null, totalAmount: 0 };
  }

  return {
    category: result[0]._id,
    totalAmount: result[0].totalAmount,
    percentage: result[0].totalAmount > 0 ? Math.round((result[0].totalAmount / totalExpense) * 100) : 0,
  };
};

export default { getSummary, getCategorySummary, getRecentExpenses, getMonthlyTrend, getTopCategories };