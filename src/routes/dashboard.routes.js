import express from "express";
const router = express.Router();

import dashboardController from "../controllers/dashboard.controller.js";
import authenticate from "../middleware/auth.middleware.js";

router.get("/summary", authenticate, dashboardController.getSummary);

export default router;