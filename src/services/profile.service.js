import User from "../models/user.model.js";

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("name email profileImage monthlyBudget status").lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateMonthlyBudget = async (userId, monthlyBudget) => {
  const budgetValue = Number(monthlyBudget);

  if (Number.isNaN(budgetValue) || budgetValue < 0) {
    throw new Error("monthlyBudget must be a non-negative number");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { monthlyBudget: budgetValue },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return {
    monthlyBudget: user.monthlyBudget,
  };
};

export default { getProfile, updateMonthlyBudget };
