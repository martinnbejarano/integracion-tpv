import { Schema, model } from "mongoose";
import mongoose from "mongoose";
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["company_admin", "branch_admin"],
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: function () {
        return this.role === "branch_admin";
      },
    },
  },
  { timestamps: true, versionKey: false }
);

export const User = model("User", userSchema);
