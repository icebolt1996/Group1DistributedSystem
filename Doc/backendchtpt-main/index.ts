const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
import type { Request, Response, NextFunction } from "express";
// Load biến môi trường từ file .env
dotenv.config();

// Import router (CommonJS style)
const clinicRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI not defined in environment variables");
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Kết nối MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err: any) => {
    console.error("❌ MongoDB connection error:", err?.message || err);
  });

// Routes
app.use("/api", clinicRoutes);
app.use("/auth", authRoutes);
// Home route
app.get("/", (req: Request, res: Response) => {
  res.send("🏥 Clinic API is running");
});

// Middleware bắt lỗi
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err?.message || "Unknown error";
  console.error("❌ Unhandled error:", message);
  res.status(500).json({ error: message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
