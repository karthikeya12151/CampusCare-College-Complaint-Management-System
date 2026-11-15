const r = require("express").Router();
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");
r.use(auth);

r.post("/", async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    if (!title || !description || !category || !location) return res.status(400).json({ message: "Complete all complaint fields." });
    const c = await Complaint.create({
      title, description, category, location, student: req.user._id,
      updates: [{ status: "Submitted", note: "Complaint submitted successfully.", updatedBy: req.user._id }]
    });
    res.status(201).json({ message: "Complaint submitted.", complaint: c });
  } catch (e) { next(e); }
});
r.get("/mine", async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (e) { next(e); }
});
r.get("/:id", async (req, res, next) => {
  try {
    const c = await Complaint.findById(req.params.id).populate("student", "name email department").populate("updates.updatedBy", "name role");
    if (!c) return res.status(404).json({ message: "Complaint not found." });
    if (req.user.role !== "admin" && String(c.student._id) !== String(req.user._id)) return res.status(403).json({ message: "Not authorized." });
    res.json({ complaint: c });
  } catch (e) { next(e); }
});
module.exports = r;
