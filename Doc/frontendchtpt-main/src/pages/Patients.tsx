import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface PatientRef {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string[];
}

interface PatientUser {
  _id: string;
  username: string;
  role: string;
  refId: PatientRef;
}

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(
          "https://dq5w4g-3000.csb.app/api/patients",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
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

  const filteredPatients = patients.filter((p) => {
    const keyword = search.toLowerCase();
    return (
      p.username.toLowerCase().includes(keyword) ||
      p.refId.fullName.toLowerCase().includes(keyword) ||
      p.refId.phone?.includes(keyword)
    );
  });

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="patients-container">
      <h2>Danh sách bệnh nhân</h2>

      <input
        type="text"
        placeholder="Tìm kiếm"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="search-input"
      />

      <div className="table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>STT</th>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Ngày sinh</th>
              <th>Giới tính</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Tiền sử bệnh</th>
              {user?.role === "admin" && (
                <th style={{ textAlign: "center" }}>Reset</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentPatients.length ? (
              currentPatients.map((p, i) => (
                <tr key={p._id}>
                  <td style={{ textAlign: "center" }}>
                    {indexOfFirst + i + 1}
                  </td>
                  <td>{p.username}</td>
                  <td>{p.refId.fullName}</td>
                  <td>
                    {new Date(p.refId.dateOfBirth).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{p.refId.gender === "male" ? "Nam" : "Nữ"}</td>
                  <td>{p.refId.phone || "-"}</td>
                  <td>{p.refId.email || "-"}</td>
                  <td>{p.refId.address || "-"}</td>
                  <td>
                    {p.refId.medicalHistory?.length ? (
                      <ul>
                        {p.refId.medicalHistory.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </td>
                  {user?.role === "admin" && (
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="reset-btn"
                        onClick={() => handleResetPassword(p.username)}
                      >
                        Reset
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user?.role === "admin" ? 10 : 9}>
                  <div style={{ textAlign: "center", padding: "1rem" }}>
                    Không tìm thấy bệnh nhân phù hợp.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default Patients;
