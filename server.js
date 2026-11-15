require("dotenv").config();
const express = require("express"), mongoose = require("mongoose"), helmet = require("helmet"), cors = require("cors"), rateLimit = require("express-rate-limit"), path = require("path");
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:4000" }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/api/health", (_, res) => res.json({ status: "ok", service: "CampusCare API" }));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/complaints", require("./src/routes/complaints"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use((err, req, res, next) => { console.error(err); res.status(err.status || 500).json({ message: err.message || "Server error" }); });
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscare")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 4000, () => console.log("CampusCare: http://localhost:" + (process.env.PORT || 4000)));
  })
  .catch(e => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
