import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Doctor {
  _id: string;
  username: string;
  role: string;
  refId: {
    _id: string;
    fullName: string;
    specialty: string;
    phone: String;
    email: string;
  };
}

const Doctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const doctorsPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("https://dq5w4g-3000.csb.app/api/doctors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleResetPassword = async (username: string) => {
    try {
      await axios.post(
        "https://dq5w4g-3000.csb.app/api/reset-password",
        { username },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(`Đã reset mật khẩu cho ${username}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi reset mật khẩu.");
    }
  };

  const handleViewDetail = (username: string) => {
    navigate(`/doctors/${username}`); // giả sử bạn có route chi tiết dạng này
  };

  const filteredDoctors = doctors.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.username.toLowerCase().includes(term) ||
      d.refId.fullName.toLowerCase().includes(term) ||
      d.refId.specialty.toLowerCase().includes(term) ||
      d.refId.phone.toLowerCase().includes(term)
    );
  });

  const indexOfLast = currentPage * doctorsPerPage;
  const indexOfFirst = indexOfLast - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  return (
    <div className="doctors-container">
      <h2>Danh sách bác sĩ</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Tìm kiếm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "0.5rem", width: "60%" }}
        />
        <button onClick={() => navigate("/doctors/add")} className="add-btn">
          + Thêm mới
        </button>
      </div>

      <table className="doctors-table">
        <thead>
          <tr>
            <th className="stt">STT</th>
            <th className="username">Username</th>
            <th className="fullname">Họ tên</th>
            <th className="specialty">Chuyên khoa</th>
            <th className="phone">SĐT</th>
            <th className="email">Email</th>
            {user?.role === "admin" && <th className="reset">Reset</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : currentDoctors.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                Không có bác sĩ nào.
              </td>
            </tr>
          ) : (
            currentDoctors.map((d, i) => (
              <tr key={d._id}>
                <td className="stt">{indexOfFirst + i + 1}</td>
                {/* <td
                  className="username"
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => handleViewDetail(d.username)}
                >
                  {d.username}
                </td> */}
                <td className="username">{d.username}</td>
                <td className="fullname">{d.refId.fullName}</td>
                <td className="specialty">{d.refId.specialty}</td>
                <td className="phone">{d.refId.phone}</td>
                <td className="email">{d.refId.email || "-"}</td>
                {user?.role === "admin" && (
                  <td className="reset">
                    <button
                      className="reset-btn"
                      onClick={() => handleResetPassword(d.username)}
                    >
                      Reset
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
