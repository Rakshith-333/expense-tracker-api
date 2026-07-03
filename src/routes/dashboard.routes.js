import express from "express";
const router = express.Router();

import dashboardController from "../controllers/dashboard.controller.js";
import authenticate from "../middleware/auth.middleware.js";


router.get("/", authenticate, dashboardController.getDashboard);
// Optional: Keep these for testing/debugging
router.get("/summary", authenticate, dashboardController.getSummary);
router.get("/category-summary", authenticate, dashboardController.getCategorySummary);
router.get("/recent-expenses", authenticate, dashboardController.getRecentExpenses);
router.get("/monthly-trend", authenticate, dashboardController.getMonthlyTrend);
router.get("/top-categories", authenticate, dashboardController.getTopCategories);



export default router;