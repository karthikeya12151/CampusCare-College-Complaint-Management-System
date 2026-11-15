const mongoose = require("mongoose");
const update = new mongoose.Schema({
  status: { type: String, enum: ["Submitted", "In Progress", "Resolved", "Rejected"], required: true },
  note: { type: String, trim: true, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now }
});
const schema = new mongoose.Schema({
  complaintCode: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, enum: ["Classroom", "Laboratory", "Hostel", "Wi-Fi / Network", "Library", "Washroom", "Other"] },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Submitted", "In Progress", "Resolved", "Rejected"], default: "Submitted" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updates: { type: [update], default: [] }
}, { timestamps: true });
schema.pre("validate", function(next) {
  if (!this.complaintCode) this.complaintCode = "CC-" + Date.now().toString().slice(-8) + "-" + Math.floor(Math.random() * 90 + 10);
  next();
});
module.exports = mongoose.model("Complaint", schema);
