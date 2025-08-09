// RESTful API cho MongoDB - Node.js (Express + Mongoose)

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const authenticate = require("../middleware/auth");
// Models
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");
const Medicine = require("../models/Medicine");

router.get("/users/username/:username", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .lean()
      .populate({
        path: "refId",
        // refPath được sử dụng để xác định bảng liên kết động
        refPath: "roleRef",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userInfo = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    // Nếu có thông tin chi tiết, gắn vào
    if (user.refId) {
      userInfo.details = user.refId;
    }
    console.log("benh nhan: ", userInfo);
    res.json(userInfo);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/medical-records", authenticate, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { fromDate, toDate, patientUsername, doctorUsername } = req.query;

    let filter = {};

    if (role === "patient") {
      const user = await User.findById(userId).populate("refId").lean();
      if (!user || !user.refId) {
        return res
          .status(403)
          .json({ message: "Không xác định được bệnh nhân từ user ID." });
      }
      filter.patientId = user.refId._id;
    }

    // Thêm điều kiện lọc theo ngày
    if (fromDate || toDate) {
      filter.visitDate = {};
      if (fromDate) filter.visitDate.$gte = new Date(fromDate);
      if (toDate) filter.visitDate.$lte = new Date(toDate);
    }

    // Lọc theo username bệnh nhân
    if (patientUsername) {
      const patientUser = await User.findOne({
        username: patientUsername,
        role: "patient",
      }).populate("refId");
      if (patientUser && patientUser.refId) {
        filter.patientId = patientUser.refId._id;
      } else {
        return res
          .status(404)
          .json({ message: "Không tìm thấy bệnh nhân với username này." });
      }
    }

    // Lọc theo username bác sĩ
    if (doctorUsername) {
      const doctorUser = await User.findOne({
        username: doctorUsername,
        role: "doctor",
      }).populate("refId");
      if (doctorUser && doctorUser.refId) {
        filter.doctorId = doctorUser.refId._id;
      } else {
        return res
          .status(404)
          .json({ message: "Không tìm thấy bác sĩ với username này." });
      }
    }

    const records = await MedicalRecord.find(filter)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName specialty email")
      .sort({ visitDate: -1 });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử khám bệnh." });
  }
});

router.get("/patients", authenticate, async (req, res) => {
  console.log("Thông tin từ token:", req.user);
  try {
    const { role } = req.user;

    if (role !== "doctor" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Không có quyền truy cập danh sách bệnh nhân." });
    }

    const patients = await User.find({ role: "patient" })
      .populate({
        path: "refId",
        model: "Patient",
        select: "fullName email gender dateOfBirth",
      })
      .select("username role refId");

    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách bệnh nhân." });
  }
});

router.get("/doctors", authenticate, async (req, res) => {
  console.log("Thông tin từ token:", req.user);
  try {
    const { role } = req.user;

    if (role !== "doctor" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Không có quyền truy cập danh sách bác sĩ." });
    }

    const doctors = await User.find({ role: "doctor" })
      .populate({
        path: "refId",
        model: "Doctor",
        select: "fullName phone email specialty",
      })
      .select("username role refId");

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách bác sĩ." });
  }
});

router.post("/reset-password", authenticate, async (req, res) => {
  const { role } = req.user;
  const { username } = req.body;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Chỉ admin mới có quyền reset mật khẩu." });
  }

  if (!username) {
    return res.status(400).json({ message: "Vui lòng cung cấp username." });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    user.password = "123456";
    await user.save();

    res
      .status(200)
      .json({ message: `Mật khẩu của '${username}' đã được đặt lại.` });
  } catch (error) {
    console.error("Lỗi khi reset mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server khi reset mật khẩu." });
  }
});

router.post("/doctors", authenticate, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới có quyền tạo bác sĩ." });
    }

    const { username, fullName, specialty, phone, email } = req.body;

    if (!username || !fullName || !specialty || !phone || !email) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username đã tồn tại." });
    }

    // 1. Tạo bác sĩ mới
    const newDoctor = await Doctor.create({
      fullName,
      specialty,
      phone,
      email,
    });

    // 2. Tạo user liên kết
    const newUser = new User({
      username,
      password: "123456", // presave hook sẽ tự hash
      role: "doctor",
      refId: newDoctor._id,
      roleRef: "Doctor",
    });

    await newUser.save();

    res.status(201).json({
      message: "Tạo bác sĩ thành công.",
      doctor: {
        username,
        fullName,
        specialty,
        phone,
        email,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo bác sĩ:", error);
    res.status(500).json({ message: "Lỗi server khi tạo bác sĩ." });
  }
});
router.patch("/users/me", authenticate, async (req, res) => {
  try {
    console.log("Thông tin từ token:", req.user);
    const { role, userId } = req.user;

    // Tìm người dùng theo _id
    const user = await User.findById(userId);
    if (!user || !user.refId) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    let allowedFields = {};
    let Model = null;

    // Xác định role để chọn model và trường cho phép cập nhật
    if (role === "patient") {
      Model = Patient;
      allowedFields = {
        fullName: 1,
        dateOfBirth: 1,
        gender: 1,
        address: 1,
        email: 1,
        phone: 1,
      };
    } else if (role === "doctor") {
      Model = Doctor;
      allowedFields = {
        fullName: 1,
        specialty: 1,
        email: 1,
        phone: 1,
      };
    } else {
      return res.status(403).json({ message: "Không có quyền sửa thông tin." });
    }

    // Lọc các trường hợp lệ từ req.body cho doctor/patient
    const updateData = {};
    Object.keys(req.body).forEach((field) => {
      if (allowedFields[field]) {
        updateData[field] = req.body[field];
      }
    });

    // Cập nhật thông tin doctor/patient
    const updatedProfile = await Model.findByIdAndUpdate(
      user.refId,
      updateData,
      { new: true }
    );

    // Nếu có gửi kèm password mới thì cập nhật ở model User
    if (req.body.password) {
      user.password = req.body.password; // sẽ được hash tự động nhờ pre('save')
      await user.save();
    }

    res.status(200).json({
      message: "Cập nhật thông tin thành công.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật thông tin." });
  }
});

// GET /medical-records/:id
router.get("/medical-records/:id", async (req, res) => {
  console.log("Thông tin từ:", req.params.id);
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate({
        path: "doctorId",
        select: "fullName specialty phone email",
        model: "Doctor",
      })
      .populate({
        path: "patientId",
        select:
          "fullName dateOfBirth gender phone email address medicalHistory",
        model: "Patient",
      });

    if (!record) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ bệnh án." });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error("Lỗi khi lấy hồ sơ bệnh án:", error);
    res.status(500).json({ message: "Lỗi server khi lấy hồ sơ bệnh án." });
  }
});

// PATCH /medical-records/:id
router.patch("/medical-records/:id", async (req, res) => {
  try {
    const allowedFields = [
      "symptoms",
      "diagnosis",
      "prescription",
      "notes",
      "attachments",
    ];

    const updateData = {};
    for (let field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Không tìm thấy phiếu khám." });
    }

    res.status(200).json({
      message: "Cập nhật phiếu khám thành công.",
      medicalRecord: updatedRecord,
    });
  } catch (error) {
    console.error("Lỗi cập nhật phiếu khám:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật phiếu khám." });
  }
});

router.post("/medical-records", authenticate, async (req, res) => {
  console.log("auth tra ve: ", req.user);
  try {
    const {
      patientUsername,
      fullName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      visitDate,
      symptoms,
      diagnosis,
      notes,
      prescription,
      attachments,
    } = req.body;

    // Kiểm tra hoặc tạo User
    let user = await User.findOne({ username: patientUsername });

    if (!user) {
      const patient = await Patient.create({
        fullName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
      });
      console.log("patient moi: ", patient);

      user = await User.create({
        username: patientUsername,
        password: "123456",
        role: "patient",
        refId: patient._id,
        roleRef: "Patient",
      });
    }
    console.log("user: ", user);
    const patientId = user.refId;

    if (!patientId) {
      return res.status(500).json({ message: "Không thể xác định bệnh nhân." });
    }

    doctor = await User.findById(req.user.userId);
    console.log("doctor: ", doctor);
    // Lưu MedicalRecord
    const medicalRecord = new MedicalRecord({
      patientId: patientId,
      doctorId: doctor.refId, // bác sĩ hiện tại (nếu có), bạn cần populate req.user đúng
      visitDate,
      symptoms,
      diagnosis,
      notes,
      prescription,
      attachments,
    });

    await medicalRecord.save();

    res.status(201).json({
      message: "Tạo phiếu khám thành công",
      medicalRecordId: medicalRecord._id,
    });
  } catch (error) {
    console.error("Lỗi tạo phiếu khám:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/medical-records/:id
router.delete("/medical-records/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRecord = await MedicalRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Không tìm thấy phiếu khám" });
    }

    res.status(200).json({
      message: "Xóa phiếu khám thành công",
      deletedId: deletedRecord._id,
    });
  } catch (error) {
    console.error("Lỗi khi xóa phiếu khám:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
