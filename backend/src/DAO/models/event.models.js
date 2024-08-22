import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    state: ["QR_SCAN", "REQUEST_ASISTANCE", "REQUEST_BILL", "EMPTY_TABLE"],
    owner: { type: String, required: true },
    message: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

export const Event = model("Event", eventSchema);
