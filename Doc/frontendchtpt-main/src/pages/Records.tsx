import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface MedicalRecord {
  _id: string;
  patientId: { fullName: string; email: string };
  doctorId: { fullName: string; specialty: string; email: string };
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  prescription: {
    medicineName: string;
    dosage: string;
    instruction: string;
  }[];
  notes: string;
  createdAt: String;
}

const Records = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    patientUsername: "",
    doctorUsername: "",
    patientName: "",
    doctorName: "",
  });

  const fetchRecords = async (customFilters = filters) => {
    try {
      setLoading(true);

      // Tạo params từ bộ lọc không rỗng
      const params: any = {};
      if (customFilters.fromDate) params.fromDate = customFilters.fromDate;
      if (customFilters.toDate) params.toDate = customFilters.toDate;
      if (customFilters.patientUsername)
        params.patientUsername = customFilters.patientUsername;
      if (customFilters.doctorUsername)
        params.doctorUsername = customFilters.doctorUsername;

      const res = await axios.get(
        "https://dq5w4g-3000.csb.app/api/medical-records",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      // Lọc theo tên nếu có
      let filtered = res.data.filter((rec: MedicalRecord) => {
        const patientMatch = customFilters.patientName
          ? rec.patientId?.fullName
              ?.toLowerCase()
              .includes(customFilters.patientName.toLowerCase())
          : true;

        const doctorMatch = customFilters.doctorName
          ? rec.doctorId?.fullName
              ?.toLowerCase()
              .includes(customFilters.doctorName.toLowerCase())
          : true;

        return patientMatch && doctorMatch;
      });

      // Sắp xếp mới nhất lên đầu (ưu tiên createdAt, fallback sang visitDate)
      filtered.sort((a: MedicalRecord, b: MedicalRecord) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt as string).getTime()
          : new Date(a.visitDate).getTime();
        const dateB = b.createdAt
          ? new Date(b.createdAt as string).getTime()
          : new Date(b.visitDate).getTime();
        return dateB - dateA;
      });

      setRecords(filtered);
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử khám bệnh:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi vừa load trang
  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchRecords();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    const cleared = {
      fromDate: "",
      toDate: "",
      patientUsername: "",
      doctorUsername: "",
      patientName: "",
      doctorName: "",
    };
    setFilters(cleared);
    fetchRecords(cleared);
  };

  const handleAddNew = () => {
    navigate("/records/add");
  };

  return (
    <div className="history-container">
      <h2>Lịch sử khám bệnh</h2>

      <div className="filter-section">
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleChange}
        />
        {user?.role !== "patient" && (
          <>
            <input
              type="text"
              name="patientName"
              placeholder="Tên bệnh nhân"
              value={filters.patientName}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
            />
            <input
              type="text"
              name="doctorName"
              placeholder="Tên bác sĩ"
              value={filters.doctorName}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
            />
            <input
              type="text"
              name="patientUsername"
              placeholder="Username bệnh nhân"
              value={filters.patientUsername}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
            />
            <input
              type="text"
              name="doctorUsername"
              placeholder="Username bác sĩ"
              value={filters.doctorUsername}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
            />
          </>
        )}
        <button onClick={handleSearch}>Tìm kiếm</button>
        <button onClick={handleReset} className="reset-btn">
          Reset
        </button>
        {(user?.role === "doctor" || user?.role === "admin") && (
          <button onClick={handleAddNew} className="add-btn">
            + Thêm phiếu khám
          </button>
        )}
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : records.length === 0 ? (
          <p>Không có kết quả phù hợp.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày khám</th>
                <th>Bệnh nhân</th>
                <th>Bác sĩ</th>
                <th>Triệu chứng</th>
                <th>Chẩn đoán</th>
                <th>Đơn thuốc</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => (
                <tr
                  key={rec._id}
                  onClick={() => navigate(`/medical-records/${rec._id}`)}
                  style={{ cursor: "pointer" }}
                  title="Xem chi tiết phiếu khám"
                >
                  <td>{idx + 1}</td>
                  <td>{new Date(rec.visitDate).toLocaleDateString()}</td>
                  <td>{rec.patientId?.fullName}</td>
                  <td>{rec.doctorId?.fullName}</td>
                  <td>{rec.symptoms}</td>
                  <td>{rec.diagnosis}</td>
                  <td>
                    <ul>
                      {rec.prescription.map((med, i) => (
                        <li key={i}>
                          <strong>{med.medicineName}</strong> - {med.dosage} -{" "}
                          {med.instruction}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{rec.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Records;
