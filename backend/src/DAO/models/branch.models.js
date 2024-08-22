import { Schema, model } from "mongoose";

const branchSchema = new Schema(
  {
    name: { type: String, required: true },
    direction: { type: String, required: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Branch = model("Branch", branchSchema);
