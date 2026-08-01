import User from "../models/user.model.js";

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("name email profileImage mobileNumber monthlyBudget status").lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateProfile = async (userId, profileData) => {
  const payload = {
    name: profileData?.name?.trim(),
    mobileNumber: profileData?.mobileNumber?.trim(),
  };

  if (!payload.name || !payload.mobileNumber) {
    throw new Error("name and mobileNumber are required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    payload,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return {
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    monthlyBudget: user.monthlyBudget,
    status: user.status,
    profileImage: user.profileImage,
  };
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

export default { getProfile, updateProfile, updateMonthlyBudget };
