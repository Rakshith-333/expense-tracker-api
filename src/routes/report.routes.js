import express from "express";
const router = express.Router();

import reportController from "../controllers/report.controller.js";
import authenticate from "../middleware/auth.middleware.js";

router.get("/export", authenticate, reportController.exportReport);

export default router;
