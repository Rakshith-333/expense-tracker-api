import dashboardService from "../services/dashboard.service.js";

const getDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [summary, categorySummary, recentExpenses, monthlyTrend, topCategories] = await Promise.all([
            dashboardService.getSummary(userId),
            dashboardService.getCategorySummary(userId),
            dashboardService.getRecentExpenses(userId),
            dashboardService.getMonthlyTrend(userId),
            dashboardService.getTopCategories(userId)
        ]);

        return res.status(200).json({
            success: true,
            message: "Dashboard data retrieved successfully",
            data: {
                summary,
                categorySummary,
                recentExpenses,
                monthlyTrend,
                topCategories
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSummary = async (req, res) => {
    try {
        const summary = await dashboardService.getSummary(req.user.userId);
        return res.status(200).json({ success: true, message: "Dashboard summary retrieved successfully", data: summary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getCategorySummary = async (req, res) => {
    try {
        const categorySummary = await dashboardService.getCategorySummary(req.user.userId);
        return res.status(200).json({ success: true, message: "Category summary retrieved successfully", data: categorySummary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getRecentExpenses = async (req, res) => {
    try {
        const recentExpenses = await dashboardService.getRecentExpenses(req.user.userId);
        return res.status(200).json({ success: true, message: "Recent expenses retrieved successfully", data: recentExpenses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMonthlyTrend = async (req, res) => {
    try {
        const monthlyTrend = await dashboardService.getMonthlyTrend(req.user.userId);
        return res.status(200).json({ success: true, message: "Monthly trend retrieved successfully", data: monthlyTrend });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTopCategories = async (req, res) => {
    try {
        const topCategories = await dashboardService.getTopCategories(req.user.userId);
        return res.status(200).json({ success: true, message: "Top categories retrieved successfully", data: topCategories });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default { getDashboard, getSummary, getCategorySummary, getRecentExpenses, getMonthlyTrend, getTopCategories };