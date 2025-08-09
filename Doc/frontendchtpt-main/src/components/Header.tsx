import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="main-header">
        <nav className="nav-container">
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              🏥 HealthCare
            </Link>
            <Link to="/">Trang chủ</Link>
            {user && <Link to="/records">Lịch sử khám</Link>}
            {user && (user.role === "admin" || user.role === "doctor") && (
              <>
                <Link to="/patients">Bệnh nhân</Link>
                <Link to="/doctors">Bác sĩ</Link>
              </>
            )}
          </div>

          <div className="nav-right">
            {!user ? (
              <Link to="/login" className="nav-auth">
                Đăng nhập
              </Link>
            ) : (
              <>
                <Link to="/profile" className="nav-auth">
                  Hồ sơ
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="nav-auth"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <style>{`
        .main-header {
          background-color: #1e293b; /* nền xanh đậm */
          padding: 1rem 2rem;
          border-bottom: 2px solid #0f172a;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .nav-logo {
          font-size: 1.25rem;
          font-weight: bold;
          color: #38bdf8; /* xanh da trời */
          text-decoration: none;
        }

        .nav-container a, .nav-container button {
          color: #f1f5f9; /* chữ trắng xám */
          background-color: transparent;
          font-size: 1rem;
          padding: 0.5rem 0.9rem;
          text-decoration: none;
          border: none;
          border-radius: 6px;
          transition: background-color 0.3s ease;
          cursor: pointer;
        }

        .nav-container a:hover,
        .nav-container button:hover {
          background-color: rgba(255, 255, 255, 0.08); /* nền mờ nhẹ */
        }

        .nav-auth {
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </>
  );
};

export default Header;
