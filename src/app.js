import express from "express";
import cors from 'cors';
import authRoutes from "./routes/auth.routes.js";
import authenticate from "./middleware/auth.middleware.js";
import expenseRoutes from "./routes/expense.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/reports", reportRoutes);

export default app;