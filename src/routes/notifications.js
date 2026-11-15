const r = require("express").Router();
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");
r.use(auth);
r.get("/", async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).populate("complaint", "complaintCode title").sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ recipient: req.user._id, readAt: null });
    res.json({ notifications, unread });
  } catch (e) { next(e); }
});
r.patch("/:id/read", async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { readAt: new Date() }, { new: true });
    if (!n) return res.status(404).json({ message: "Notification not found." });
    res.json({ notification: n });
  } catch (e) { next(e); }
});
r.patch("/read-all", async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, readAt: null }, { readAt: new Date() });
    res.json({ message: "All notifications marked as read." });
  } catch (e) { next(e); }
});
module.exports = r;
