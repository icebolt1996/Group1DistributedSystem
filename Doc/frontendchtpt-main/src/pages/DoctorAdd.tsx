import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorAdd = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    specialty: "",
    phone: "",
    email: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("https://dq5w4g-3000.csb.app/api/doctors", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Thêm bác sĩ thành công");
      navigate("/doctors");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra.");
    }
  };

  return (
    <div className="form-container">
      <h2>Thêm bác sĩ mới</h2>
      {error && <p className="error-text">{error}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Họ tên:</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Chuyên khoa:</label>
          <input
            type="text"
            name="specialty"
            required
            value={formData.specialty}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>SĐT:</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit">Lưu bác sĩ</button>
        </div>
      </form>
    </div>
  );
};

export default DoctorAdd;
