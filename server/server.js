const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Route modules (one per integrated feature module)
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const quizRoutes = require("./routes/quizRoutes");

// Initializes the shared MySQL pool (config/db.js logs connection status).
require("./config/db");

const app = express();

// CORS must be configured before routes so preflight requests are handled.
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Lumen CMS API is running." });
});

// Mount each module's routes under its own namespace.
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/quizzes", quizRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler — never leak internal error details/stack traces.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Lumen CMS server running on http://localhost:${PORT}`);
});
