import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ["Food & Dining", "Transportation", "Housing", "Shopping","Education", "Entertainment", "Travel", "Family", "Financial", "Work", "Personal", "Charity", "Health", "Other"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  expenseDate: {
    type: Date,
    required: true
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ["UPI", "Cash", "Credit Card", "Debit Card", "Net Banking", "Mobile Wallet", "Bank Transfer (NEFT/RTGS/IMPS)", "Cheque"]
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});
const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;