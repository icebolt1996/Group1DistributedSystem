const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// === ĐĂNG NHẬP ===
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    token,
    user: {
      username: user.username,
      role: user.role,
      refId: user.refId,
      roleRef: user.roleRef,
    },
  });
});

// === ĐĂNG XUẤT ===
// Logout sẽ do frontend xử lý (xóa token)
router.post("/logout", (_req, res) => {
  // Backend không cần làm gì nếu dùng JWT stateless
  res.json({ message: "Đăng xuất thành công (client hãy xóa token)" });
});

module.exports = router;
