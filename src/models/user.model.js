import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  mobileNumber: {
    type: String,
    default: null,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  monthlyBudget: {
    type: Number,
    default: 0,
    min: 0
  }
},
{timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;