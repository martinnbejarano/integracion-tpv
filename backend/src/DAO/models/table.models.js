import { Schema, model } from "mongoose";

const tableSchema = new Schema(
  {
    positionX: { type: String, required: true },
    positionY: { type: String, required: true },
    state: {
      type: String,
      enum: ["Available", "Occupied", "Waiting for bill", "Needs attention"],
      default: "Available",
      required: true,
    },
    description: { type: String, default: "" }, //table description
  },
  { timestamps: true, versionKey: false }
);

export const table = model("Table", tableSchema);
