import dashboardService from "../services/dashboard.service.js";

const getSummary = async (req, res) => {
    try {
        const summary = await dashboardService.getSummary(req.user.userId);
        return res.status(200).json({ success: true, message: "Dashboard summary retrieved successfully", data: summary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default { getSummary };