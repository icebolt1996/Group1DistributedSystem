import React from "react";

const Home = () => {
  return (
    <>
      <main className="home-container">
        <div className="home-content">
          <h1 className="home-title">
            Phòng khám <span>Chẩn đoán hình ảnh</span>
          </h1>
          <p className="home-subtitle">
            Đem đến chuẩn xác và tin cậy cho từng ca khám của bạn với công nghệ
            hiện đại hàng đầu.
          </p>
          <button
            className="home-btn"
            onClick={() => alert("Chào mừng bạn đến phòng khám!")}
          >
            Gọi ngay cho chúng tôi: 0377005596
          </button>
          <div className="home-features">
            <div className="feature-item">
              <i className="fas fa-stethoscope"></i>
              <h3>Chẩn đoán chính xác</h3>
              <p>Sử dụng thiết bị hiện đại, phân tích dữ liệu chuyên sâu.</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-user-md"></i>
              <h3>Đội ngũ bác sĩ giỏi</h3>
              <p>Kinh nghiệm dày dặn, tận tâm với người bệnh.</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-clock"></i>
              <h3>Tiết kiệm thời gian</h3>
              <p>Quy trình nhanh chóng, giảm thời gian chờ đợi.</p>
            </div>
          </div>
        </div>
        <div className="home-image-wrapper" aria-label="Ảnh phòng khám">
          <img
            src="https://afamilycdn.com/150157425591193600/2025/4/17/14-17448633650922137481227-1744863973670-1744863973737544645163-1744901093895-17449011108952045561247.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Phòng khám chẩn đoán hình ảnh"
          />
        </div>
      </main>

      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #f0f0f0;
        }

        .home-container {
          display: flex;
          max-width: 1200px;
          margin: 4rem auto;
          background: rgba(0,0,0,0.45);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          animation: fadeInUp 1s ease forwards;
        }

        .home-content {
          flex: 1;
          padding: 3rem 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2rem;
        }

        .home-title {
          font-size: 3.8rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin: 0;
          color: #fff;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.4);
        }

        .home-title span {
          color: #fbbf24; /* vàng cam */
          text-transform: uppercase;
        }

        .home-subtitle {
          font-size: 1.3rem;
          line-height: 1.6;
          max-width: 480px;
          color: #ddd;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
        }

        .home-btn {
          background: #fbbf24;
          border: none;
          padding: 1rem 2.8rem;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 40px;
          cursor: pointer;
          color: #222;
          box-shadow: 0 6px 15px rgba(251,191,36,0.5);
          transition: background 0.3s ease, transform 0.2s ease;
          align-self: flex-start;
        }

        .home-btn:hover {
          background: #ffdc73;
          transform: scale(1.05);
        }

        .home-features {
          margin-top: 3rem;
          display: flex;
          gap: 2.5rem;
        }

        .feature-item {
          flex: 1;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transition: transform 0.3s ease;
          cursor: default;
        }

        .feature-item:hover {
          transform: translateY(-10px);
          background: rgba(255,255,255,0.18);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .feature-item i {
          font-size: 3rem;
          color: #fbbf24;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 3px #fbbf24);
        }

        .feature-item h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.7rem;
          color: #fff;
        }

        .feature-item p {
          font-size: 1rem;
          color: #eee;
          line-height: 1.4;
        }

        .home-image-wrapper {
          flex: 1;
          overflow: hidden;
          border-radius: 20px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
        }

        .home-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: drop-shadow(0 0 8px rgba(0,0,0,0.6));
          transition: transform 0.6s ease;
        }

        .home-image-wrapper img:hover {
          transform: scale(1.05);
        }

        /* Animation */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .home-container {
            flex-direction: column;
            margin: 2rem 1rem;
          }
          .home-content {
            padding: 2rem 1.5rem;
            text-align: center;
          }
          .home-features {
            flex-direction: column;
            gap: 1.5rem;
          }
          .feature-item:hover {
            transform: none;
            background: rgba(255,255,255,0.15);
          }
          .home-image-wrapper {
            width: 100%;
            height: 300px;
            margin-top: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
