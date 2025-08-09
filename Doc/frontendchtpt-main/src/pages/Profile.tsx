import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `https://dq5w4g-3000.csb.app/api/users/username/${user.username}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDetails(res.data);
        setEditData(res.data.details || {});
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchDetails();
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const dataToSend = { ...editData };
      if (newPassword) {
        dataToSend.password = newPassword;
      }

      const res = await axios.patch(
        `https://dq5w4g-3000.csb.app/api/users/me`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Cập nhật thành công!");
      setNewPassword(""); // clear password field
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Cập nhật thất bại!");
    }
    setSaving(false);
  };

  if (!user) return <div>Vui lòng đăng nhập</div>;
  if (!details) return <div>Đang tải thông tin...</div>;

  return (
    <div
      className="profile-container"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <h2 className="profile-title">Thông tin cá nhân</h2>

      <div className="profile-section">
        <strong>Tên đăng nhập:</strong> {details.username}
      </div>

      <div className="profile-section">
        <strong>Vai trò:</strong> {details.role}
      </div>

      {details.details && (
        <>
          <div className="profile-section">
            <label>
              <strong>Họ tên:</strong>
            </label>
            <input
              type="text"
              value={editData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="input-field"
            />
          </div>

          {details.role === "doctor" && (
            <div className="profile-section">
              <label>
                <strong>Chuyên môn:</strong>
              </label>
              <input
                type="text"
                value={editData.specialty || ""}
                onChange={(e) => handleChange("specialty", e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {details.role === "patient" && (
            <>
              <div className="profile-section">
                <label>
                  <strong>Ngày sinh:</strong>
                </label>
                <input
                  type="date"
                  value={editData.dateOfBirth?.substring(0, 10) || ""}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="profile-section">
                <label>
                  <strong>Giới tính:</strong>
                </label>
                <select
                  value={editData.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="input-field"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="profile-section">
                <label>
                  <strong>Địa chỉ:</strong>
                </label>
                <input
                  type="text"
                  value={editData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          )}

          <div className="profile-section">
            <label>
              <strong>Email:</strong>
            </label>
            <input
              type="email"
              value={editData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="profile-section">
            <label>
              <strong>SĐT:</strong>
            </label>
            <input
              type="text"
              value={editData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="profile-section">
            <label>
              <strong>Mật khẩu mới:</strong>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="profile-section" style={{ marginTop: "16px" }}>
            <button onClick={handleSave} disabled={saving} className="save-btn">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            {message && (
              <p
                style={{
                  marginTop: 8,
                  color: message.includes("thành công") ? "green" : "red",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
