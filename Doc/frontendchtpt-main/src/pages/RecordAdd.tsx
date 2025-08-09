import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Hàm upload lên Cloudinary, giống như trong RecordDetail
const uploadToCloudinary = async (
  file: File
): Promise<{ url: string; type: string }> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "phongkham"); // thay bằng preset của bạn

  const res = await fetch("https://api.cloudinary.com/v1_1/dprnfosn0/upload", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw new Error("Upload file thất bại");
  }

  const result = await res.json();
  return {
    url: result.secure_url,
    type: file.type || "",
  };
};

export default function RecordAdd() {
  const [patientUsername, setPatientUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState([
    { medicineName: "", dosage: "", instruction: "" },
  ]);
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  // Chỉnh lại thành mảng đối tượng {url, type} như RecordDetail
  const [attachments, setAttachments] = useState<
    { url: string; type: string }[]
  >([]);
  const [visitDate, setvisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [popup, setPopup] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const resetPatientInfo = () => {
    setFullName("");
    setDateOfBirth("");
    setGender("");
    setPhone("");
    setEmail("");
    setAddress("");
  };

  useEffect(() => {
    if (
      !patientUsername ||
      patientUsername.length !== 12 ||
      !/^\d+$/.test(patientUsername)
    ) {
      resetPatientInfo();
      return;
    }

    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setPopup({ type: "error", message: "Bạn chưa đăng nhập." });
          return;
        }

        const res = await axios.get(
          `https://dq5w4g-3000.csb.app/api/users/username/${patientUsername}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = res.data?.details;
        if (!user) {
          resetPatientInfo();
          return;
        }

        setFullName(user.fullName || "");
        setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "");

        const genderValue = (user.gender || "").toLowerCase();
        if (genderValue === "male" || genderValue === "nam") {
          setGender("male");
        } else if (genderValue === "female" || genderValue === "nữ") {
          setGender("female");
        } else {
          setGender("");
        }

        setPhone(user.phone || "");
        setEmail(user.email || "");
        setAddress(user.address || "");
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          resetPatientInfo();
          setPopup({
            type: "error",
            message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
          });
        } else if (err.response?.status === 404) {
          resetPatientInfo();
        } else {
          setPopup({
            type: "error",
            message: "Không thể lấy thông tin bệnh nhân.",
          });
        }
      }
    };

    fetchPatient();
  }, [patientUsername]);

  const handlePrescriptionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newPrescriptions = [...prescription];
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    setPrescription(newPrescriptions);
  };

  const addPrescription = () =>
    setPrescription([
      ...prescription,
      { medicineName: "", dosage: "", instruction: "" },
    ]);
  const removePrescription = (index: number) =>
    setPrescription(prescription.filter((_, i) => i !== index));

  // ** Chỉnh phần file đính kèm theo recorddetail **
  const handleAttachmentChange = (
    index: number,
    field: "url" | "type",
    value: string
  ) => {
    const newAttachments = [...attachments];
    newAttachments[index] = { ...newAttachments[index], [field]: value };
    setAttachments(newAttachments);
  };

  const handleAddAttachment = () => {
    setAttachments([...attachments, { url: "", type: "" }]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File) => {
    try {
      const uploaded = await uploadToCloudinary(file);
      // Thêm mới attachment vừa upload
      setAttachments((prev) => [...prev, uploaded]);
    } catch (error) {
      alert("Upload file thất bại, thử lại nhé!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPopup({ type: "error", message: "Bạn chưa đăng nhập." });
        return;
      }

      const res = await axios.post(
        "https://dq5w4g-3000.csb.app/api/medical-records",
        {
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
          prescription: prescription.filter(
            (p) =>
              p.medicineName.trim() || p.dosage.trim() || p.instruction.trim()
          ),
          notes,
          attachments: attachments.filter((a) => a.url.trim() !== ""),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPopup({
        type: "success",
        message: "Thêm hồ sơ khám bệnh thành công!",
      });
      const newRecordId = res.data.medicalRecordId;
      if (newRecordId) {
        navigate(`/medical-records/${newRecordId}`);
      }
    } catch (err: any) {
      setPopup({
        type: "error",
        message: err.response?.data?.message || "Lỗi khi thêm hồ sơ.",
      });
    }
  };

  return (
    <div className="record-add">
      <h2>Thêm hồ sơ khám bệnh</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mã bệnh nhân (username):</label>
          <input
            type="text"
            value={patientUsername}
            onChange={(e) => setPatientUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Họ và tên:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Ngày sinh:</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Giới tính:</label>
          <select
            className="gender-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        <div className="form-group">
          <label>Số điện thoại:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Ngày khám:</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setvisitDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Triệu chứng:</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Chẩn đoán:</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Đơn thuốc:</label>
          {prescription.map((item, index) => (
            <div key={index} className="prescription-item">
              <input
                type="text"
                placeholder="Tên thuốc"
                value={item.medicineName}
                onChange={(e) =>
                  handlePrescriptionChange(
                    index,
                    "medicineName",
                    e.target.value
                  )
                }
              />
              <input
                type="text"
                placeholder="Liều lượng"
                value={item.dosage}
                onChange={(e) =>
                  handlePrescriptionChange(index, "dosage", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Hướng dẫn"
                value={item.instruction}
                onChange={(e) =>
                  handlePrescriptionChange(index, "instruction", e.target.value)
                }
              />
              {index === prescription.length - 1 ? (
                <button type="button" onClick={addPrescription}>
                  +
                </button>
              ) : (
                <button type="button" onClick={() => removePrescription(index)}>
                  -
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Ghi chú:</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Phần File đính kèm theo RecordDetail */}
        <div className="form-group">
          <label>File đính kèm:</label>

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

              await handleFileUpload(file);

              e.target.value = ""; // reset input để có thể upload lại cùng file
            }}
          />
        </div>

        <button type="submit">Thêm hồ sơ</button>
      </form>

      {popup && <div className={`popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}
