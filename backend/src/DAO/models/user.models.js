import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    direction: { type: String, required: true },
    companies: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
          required: true,
        },
      ],
    },
    branches: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
          required: true,
        },
      ],
    },
    tables: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Table",
          required: true,
        },
      ],
    },
  },
  { timestamps: true, versionKey: false }
);

export const user = model("User", employeeSchema);
