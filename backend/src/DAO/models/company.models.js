import { Schema, model } from "mongoose";
import mongoose from "mongoose";
const companySchema = new Schema(
  {
    name: { type: String, required: true },
    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Company = model("Company", companySchema);
