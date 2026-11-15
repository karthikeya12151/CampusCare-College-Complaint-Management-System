const r = require("express").Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { auth, admin } = require("../middleware/auth");
r.use(auth, admin);

r.get("/complaints", async (req, res, next) => {
  try {
    const f = {};
    if (req.query.status) f.status = req.query.status;
    if (req.query.category) f.category = req.query.category;
    if (req.query.priority) f.priority = req.query.priority;
    if (req.query.q) {
      const q = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      f.$or = [{ title: new RegExp(q, "i") }, { complaintCode: new RegExp(q, "i") }, { location: new RegExp(q, "i") }];
    }
    const complaints = await Complaint.find(f).populate("student", "name email department").sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (e) { next(e); }
});
r.patch("/complaints/:id", async (req, res, next) => {
  try {
    const { status, priority, note } = req.body;
    const statuses = ["Submitted", "In Progress", "Resolved", "Rejected"], priorities = ["Low", "Medium", "High"];
    if (status && !statuses.includes(status)) return res.status(400).json({ message: "Invalid status." });
    if (priority && !priorities.includes(priority)) return res.status(400).json({ message: "Invalid priority." });
    const c = await Complaint.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Complaint not found." });
    const oldStatus = c.status, oldPriority = c.priority;
    if (priority) c.priority = priority;
    if (status) {
      c.status = status;
      if (status !== oldStatus || note) c.updates.push({ status, note: note || `Status changed from ${oldStatus} to ${status}.`, updatedBy: req.user._id });
    }
    await c.save();
    const messages = [];
    if (status && status !== oldStatus) messages.push({ recipient: c.student, complaint: c._id, title: "Complaint status updated", message: `${c.complaintCode}: status changed to ${status}.`, type: "status" });
    if (priority && priority !== oldPriority) messages.push({ recipient: c.student, complaint: c._id, title: "Complaint priority updated", message: `${c.complaintCode}: priority changed to ${priority}.`, type: "priority" });
    if (messages.length) await Notification.insertMany(messages);
    res.json({ message: "Complaint updated.", complaint: c });
  } catch (e) { next(e); }
});
r.get("/summary", async (req, res, next) => {
  try {
    const [total, submitted, inProgress, resolved, rejected, students, highPriority] = await Promise.all([
      Complaint.countDocuments(), Complaint.countDocuments({ status: "Submitted" }),
      Complaint.countDocuments({ status: "In Progress" }), Complaint.countDocuments({ status: "Resolved" }),
      Complaint.countDocuments({ status: "Rejected" }), User.countDocuments({ role: "student" }),
      Complaint.countDocuments({ priority: "High", status: { $nin: ["Resolved", "Rejected"] } })
    ]);
    const byCategory = await Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const monthly = await Complaint.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }, { $limit: 8 }
    ]);
    res.json({ total, submitted, inProgress, resolved, rejected, students, highPriority, byCategory, monthly, resolutionRate: total ? Math.round(resolved / total * 100) : 0 });
  } catch (e) { next(e); }
});
module.exports = r;
