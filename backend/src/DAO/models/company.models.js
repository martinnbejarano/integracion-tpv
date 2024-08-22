import { Schema, model } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true },
    branches: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Company = model("Company", companySchema);
