const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["status", "priority", "general"], default: "status" },
  readAt: { type: Date, default: null }
}, { timestamps: true });
schema.index({ recipient: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", schema);
