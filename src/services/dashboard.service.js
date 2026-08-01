import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const getPercentageChange = (current, previous) => {
  if (previous === 0) {
    return { percentage: 0, trend: "neutral" };
  }

  const percentage = Math.round(((current - previous) / previous) * 100);
  return {
    percentage: Math.abs(percentage),
    trend: percentage > 0 ? "up" : "down",
  };
};

const getBudgetStatus = (utilization) => {
  if (utilization >= 101) return "Exceeded";
  if (utilization >= 81) return "Critical";
  if (utilization >= 51) return "Warning";
  return "Good";
};

const getForecastStatus = (predictedSpend, monthlyBudget) => {
  if (monthlyBudget <= 0) return "Within Budget";
  return predictedSpend > monthlyBudget ? "Likely to Exceed Budget" : "Within Budget";
};

const getSummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(userId).select("monthlyBudget").lean();

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrowUtc = new Date(todayUtc);
  tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);

  const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const firstDayOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const firstDayOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const lastDayOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const firstDayOfWeek = new Date(todayUtc);
  const day = firstDayOfWeek.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  firstDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() - diff);

  const firstDayOfPreviousWeek = new Date(firstDayOfWeek);
  firstDayOfPreviousWeek.setUTCDate(firstDayOfPreviousWeek.getUTCDate() - 7);

  const lastDayOfPreviousWeek = new Date(firstDayOfWeek);

  const [totalThisMonthResult, todaysExpensesResult, todaysTransactions, thisWeeksExpensesResult, thisMonthsTransactions, previousMonthExpensesResult, previousWeeksExpensesResult] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: userObjectId, expenseDate: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjectId, expenseDate: { $gte: todayUtc, $lt: tomorrowUtc } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
    Expense.countDocuments({
      userId: userObjectId,
      expenseDate: { $gte: todayUtc, $lt: tomorrowUtc },
    }),
    Expense.aggregate([
      { $match: { userId: userObjectId, expenseDate: { $gte: firstDayOfWeek, $lt: tomorrowUtc } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
    Expense.countDocuments({
      userId: userObjectId,
      expenseDate: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth },
    }),
    Expense.aggregate([
      { $match: { userId: userObjectId, expenseDate: { $gte: firstDayOfPreviousMonth, $lt: lastDayOfPreviousMonth } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjectId, expenseDate: { $gte: firstDayOfPreviousWeek, $lt: lastDayOfPreviousWeek } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
  ]);

  const currentMonth = totalThisMonthResult[0]?.totalAmount || 0;
  const currentWeek = thisWeeksExpensesResult[0]?.totalAmount || 0;
  const previousMonth = previousMonthExpensesResult[0]?.totalAmount || 0;
  const previousWeek = previousWeeksExpensesResult[0]?.totalAmount || 0;
  const monthlyBudget = Number(user?.monthlyBudget || 0);

  const monthComparison = getPercentageChange(currentMonth, previousMonth);
  const weekComparison = getPercentageChange(currentWeek, previousWeek);

  const remainingBalance = Math.max(monthlyBudget - currentMonth, 0);
  const budgetUtilization = monthlyBudget > 0 ? Math.round((currentMonth / monthlyBudget) * 100) : 0;
  const budgetStatus = getBudgetStatus(budgetUtilization);

  const remainingDays = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate() - now.getUTCDate();
  const dailyLimit = remainingBalance > 0 && remainingDays > 0 ? Math.round(remainingBalance / remainingDays) : 0;

  const daysElapsed = now.getUTCDate();
  const averageDailySpend = daysElapsed > 0 ? currentMonth / daysElapsed : 0;
  const predictedSpend = Math.round(averageDailySpend * new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate());
  const forecastStatus = getForecastStatus(predictedSpend, monthlyBudget);

  const comparison = {
    previousMonth,
    currentMonth,
    difference: Math.abs(previousMonth - currentMonth),
    trend: previousMonth > currentMonth ? "saved" : previousMonth < currentMonth ? "overspent" : "neutral",
  };

  return {
    monthlyBudget,
    totalSpent: currentMonth,
    remainingBalance,
    budgetUtilization,
    budgetStatus,
    remainingDays,
    dailyLimit,
    totalThisMonth: { amount: currentMonth, percentage: monthComparison.percentage, trend: monthComparison.trend },
    todaysExpenses: todaysExpensesResult[0]?.totalAmount || 0,
    todaysTransactions,
    thisWeeksExpenses: { amount: currentWeek, percentage: weekComparison.percentage, trend: weekComparison.trend },
    thisMonthsTransactions,
    comparison,
    forecast: {
      predictedSpend,
      status: forecastStatus,
    },
  };
};

// static category summary for current month
// const getCategorySummary = async (userId) => {
//   const userObjectId = new mongoose.Types.ObjectId(userId);

//   const now = new Date();

//   // Start of month (UTC)
//   const startOfMonth = new Date(
//     Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
//   );

//   // Start of next month (UTC)
//   const endOfMonth = new Date(
//     Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
//   );

//   const categorySummary = await Expense.aggregate([
//     {
//       $match: {
//         userId: userObjectId,
//         expenseDate: {
//           $gte: startOfMonth,
//           $lt: endOfMonth,
//         },
//       },
//     },
//     {
//       $group: {
//         _id: "$category",
//         totalAmount: { $sum: "$amount" },
//       },
//     },
//     {
//       $sort: { totalAmount: -1 },
//     },
//   ]);

//   const totalExpenses = categorySummary.reduce(
//     (acc, curr) => acc + curr.totalAmount,
//     0
//   );

//   return categorySummary.map((category) => ({
//     category: category._id,
//     totalAmount: category.totalAmount,
//     percentage:
//       totalExpenses > 0
//         ? Math.round((category.totalAmount / totalExpenses) * 100)
//         : 0,
//   }));
// };



// dynamic category summary based on period (today, week, month)
const getCategorySummary = async (userId, period = "month") => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const now = new Date();

  let startDate;
  let endDate;

  // ======================
  // TODAY
  // ======================
  if (period === "today") {
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
  }

  // ======================
  // WEEK
  // ======================
  else if (period === "week") {
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const day = startDate.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;

    startDate.setUTCDate(startDate.getUTCDate() - diff);

    endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 7);
  }

  // ======================
  // MONTH (DEFAULT)
  // ======================
  else {
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    endDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );
  }

  // ======================
  // AGGREGATION
  // ======================
  const categorySummary = await Expense.aggregate([
    {
      $match: {
        userId: userObjectId,
        expenseDate: {
          $gte: startDate,
          $lt: endDate,
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

  // ======================
  // TOTAL CALCULATION
  // ======================
  const totalExpenses = categorySummary.reduce(
    (acc, curr) => acc + curr.totalAmount,
    0
  );

  // ======================
  // RESPONSE FORMAT
  // ======================
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