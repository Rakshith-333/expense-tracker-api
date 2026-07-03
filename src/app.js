import express from "express";
import authRoutes from "./routes/auth.routes.js";
import authenticate from "./middleware/auth.middleware.js";
import expenseRoutes from "./routes/expense.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/auth", authRoutes);

app.get("/api/v1/profile", authenticate, (req, res) => {
  res.json({ success: true, message: "Token is valid", user: req.user });
});

export default app;