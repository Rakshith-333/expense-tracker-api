import profileService from "../services/profile.service.js";

const getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user.userId);

    return res.json({
      success: true,
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await profileService.updateProfile(req.user.userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateMonthlyBudget = async (req, res) => {
  try {
    await profileService.updateMonthlyBudget(req.user.userId, req.body.monthlyBudget);

    return res.status(200).json({
      success: true,
      message: "Monthly budget updated successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default { getProfile, updateProfile, updateMonthlyBudget };
