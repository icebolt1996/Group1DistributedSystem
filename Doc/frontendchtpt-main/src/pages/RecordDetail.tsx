import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Prescription {
  medicineName: string;
  dosage: string;
  instruction: string;
}

interface Attachment {
  type: string;
  url: string;
}

interface Patient {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: string[];
}

interface Doctor {
  fullName: string;
  specialty: string;
  phone: string;
  email: string;
}

interface MedicalRecord {
  _id: string;
  patientId: Patient;
  doctorId: Doctor;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  prescription: Prescription[];
  notes: string;
  attachments: Attachment[];
}

// Thêm hàm upload lên Cloudinary (đặt trong component hoặc ngoài)
const uploadToCloudinary = async (
  file: File
): Promise<{ url: string; type: string }> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "phongkham"); // thay bằng preset của bạn

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dprnfosn0/raw/upload",
    {
      method: "POST",
      body: data,
    }
  );

  if (!res.ok) {
    throw new Error("Upload file thất bại");
  }

  const result = await res.json();
  return {
    url: result.secure_url,
    type: file.type || "", // Lấy type file từ File object
  };
};
const RecordDetail: React.FC = () => {
  const { id } = useParams();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get(
          `https://dq5w4g-3000.csb.app/api/medical-records/${id}`
        );
        setRecord(res.data);
      } catch {
        alert("Không thể tải dữ liệu phiếu khám.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);
  const navigate = useNavigate();
  const handleChange = (field: keyof MedicalRecord, value: any) => {
    if (!record) return;
    setRecord({ ...record, [field]: value });
  };

  const handlePrescriptionChange = (
    index: number,
    field: keyof Prescription,
    value: string
  ) => {
    if (!record) return;
    const newPrescriptions = [...record.prescription];
    newPrescriptions[index][field] = value;
    setRecord({ ...record, prescription: newPrescriptions });
  };

  const handleAddPrescription = () => {
    if (!record) return;
    setRecord({
      ...record,
      prescription: [
        ...record.prescription,
        { medicineName: "", dosage: "", instruction: "" },
      ],
    });
  };

  const handleRemovePrescription = (index: number) => {
    if (!record) return;
    const newPrescriptions = [...record.prescription];
    newPrescriptions.splice(index, 1);
    setRecord({ ...record, prescription: newPrescriptions });
  };

  const handleAttachmentChange = (
    index: number,
    field: keyof Attachment,
    value: string
  ) => {
    if (!record) return;
    const newAttachments = [...record.attachments];
    newAttachments[index][field] = value;
    setRecord({ ...record, attachments: newAttachments });
  };

  const handleAddAttachment = () => {
    if (!record) return;
    setRecord({
      ...record,
      attachments: [...record.attachments, { type: "", url: "" }],
    });
  };

  const handleRemoveAttachment = (index: number) => {
    if (!record) return;
    const newAttachments = [...record.attachments];
    newAttachments.splice(index, 1);
    setRecord({ ...record, attachments: newAttachments });
  };

  // Hàm xóa phiếu khám
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa phiếu khám này không?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập.");
        return;
      }

      await axios.delete(
        `https://dq5w4g-3000.csb.app/api/medical-records/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Xóa phiếu khám thành công.");
      // Sau khi xóa thành công, điều hướng về trang danh sách hoặc trang khác
      navigate("/records");
    } catch (error: any) {
      alert(error.response?.data?.message || "❌ Xóa phiếu khám thất bại.");
    }
  };

  const handleSubmit = async () => {
    if (!record) return;
    try {
      const payload = {
        symptoms: record.symptoms,
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        notes: record.notes,
        attachments: record.attachments,
      };

      await axios.patch(
        `https://dq5w4g-3000.csb.app/api/medical-records/${id}`,
        payload
      );

      alert("✅ Cập nhật thành công.");
    } catch {
      alert("❌ Không thể cập nhật phiếu khám.");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!record) return <p>Không tìm thấy phiếu khám.</p>;

  const {
    patientId,
    doctorId,
    visitDate,
    symptoms,
    diagnosis,
    prescription,
    notes,
    attachments,
  } = record;

  return (
    <div className="record-detail">
      <h2>Chi tiết Phiếu Khám</h2>
      <section>
        <h3>Thông tin Bệnh nhân</h3>
        <p>
          <strong>Họ tên:</strong> {patientId.fullName}
        </p>
        <p>
          <strong>Ngày sinh:</strong>{" "}
          {new Date(patientId.dateOfBirth).toLocaleDateString()}
        </p>
        <p>
          <strong>Giới tính:</strong>{" "}
          {patientId.gender === "male" ? "Nam" : "Nữ"}
        </p>
        <p>
          <strong>SĐT:</strong> {patientId.phone}
        </p>
        <p>
          <strong>Email:</strong> {patientId.email}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {patientId.address}
        </p>
        <p>
          <strong>Tiền sử bệnh:</strong> {patientId.medicalHistory.join(", ")}
        </p>
      </section>
      <section>
        <h3>Thông tin Bác sĩ</h3>
        <p>
          <strong>Họ tên:</strong> {doctorId.fullName}
        </p>
        <p>
          <strong>Chuyên khoa:</strong> {doctorId.specialty}
        </p>
        <p>
          <strong>SĐT:</strong> {doctorId.phone}
        </p>
        <p>
          <strong>Email:</strong> {doctorId.email}
        </p>
      </section>
      <section>
        <h3>Thông tin khám</h3>
        <div className="form-group">
          <label>
            <strong>Triệu chứng:</strong>
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => handleChange("symptoms", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            <strong>Chẩn đoán:</strong>
          </label>
          <textarea
            value={diagnosis}
            onChange={(e) => handleChange("diagnosis", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            <strong>Ghi chú:</strong>
          </label>
          <textarea
            value={notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>
      </section>
      <section>
        <h3>Đơn thuốc</h3>
        {prescription.map((item, idx) => (
          <div key={idx} className="prescription-item">
            <input
              type="text"
              value={item.medicineName}
              onChange={(e) =>
                handlePrescriptionChange(idx, "medicineName", e.target.value)
              }
              placeholder="Tên thuốc"
            />
            <input
              type="text"
              value={item.dosage}
              onChange={(e) =>
                handlePrescriptionChange(idx, "dosage", e.target.value)
              }
              placeholder="Liều lượng"
            />
            <input
              type="text"
              value={item.instruction}
              onChange={(e) =>
                handlePrescriptionChange(idx, "instruction", e.target.value)
              }
              placeholder="Hướng dẫn"
            />
            <button type="button" onClick={() => handleRemovePrescription(idx)}>
              Xoá
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddPrescription}>
          + Thêm thuốc
        </button>
      </section>
      <section>
        <h3>File đính kèm</h3>

        {attachments.map((att, idx) => (
          <div key={idx} className="attachment-item">
            {att.type.startsWith("image/") ? (
              <img
                src={att.url}
                alt={`attachment-${idx}`}
                style={{ maxWidth: "832px" }}
              />
            ) : att.type.startsWith("video/") ? (
              <video controls width={832}>
                <source src={att.url} type={att.type} />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            ) : (
              <a href={att.url} target="_blank" rel="noopener noreferrer">
                {att.url}
              </a>
            )}

            <button type="button" onClick={() => handleRemoveAttachment(idx)}>
              Xoá
            </button>
          </div>
        ))}

        {/* Input upload file mới */}
        <input
          type="file"
          onChange={async (e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];

            try {
              // Có thể thêm loading indicator nếu muốn
              const uploaded = await uploadToCloudinary(file);
              handleAddAttachment(); // Thêm phần tử mới rỗng
              // Cập nhật phần tử mới với dữ liệu upload
              const newAttachments = [...record!.attachments];
              newAttachments.push({
                type: uploaded.type,
                url: uploaded.url,
              });
              setRecord({ ...record!, attachments: newAttachments });
              e.target.value = ""; // reset input file để có thể upload lại cùng file nếu muốn
            } catch (error) {
              alert("Upload file thất bại, thử lại nhé!");
            }
          }}
        />
      </section>
      <button className="save-btn" onClick={handleSubmit}>
        Lưu thay đổi
      </button>
      <button
        style={{
          marginTop: "1rem",
          padding: "0.6rem 1.2rem",
          background: "#dc3545",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={handleDelete}
      >
        Xóa phiếu khám
      </button>

      <style>{`
        .record-detail {
          width: 900px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          font-size: 16px;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.3rem;
        }

        textarea {
          width: 100%;
          min-height: 60px;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .prescription-item, .attachment-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .prescription-item input,
        .attachment-item input {
          flex: 1;
        }

        .prescription-item button,
        .attachment-item button {
          height: 40px;
          padding: 0 1rem;
          background: red;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .save-btn {
          margin-top: 1.5rem;
          padding: 0.6rem 1.2rem;
          background: #28a745;
          color: #fff;
          font-size: 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
};

export default RecordDetail;
