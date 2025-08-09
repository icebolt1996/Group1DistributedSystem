import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Records from "./pages/Records";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Profile from "./pages/Profile";
import DoctorAdd from "./pages/DoctorAdd";
import RecordAdd from "./pages/RecordAdd";
import RecordDetail from "./pages/RecordDetail";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/records" element={<Records />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/doctors/add" element={<DoctorAdd />} />
              <Route path="/records/add" element={<RecordAdd />} />
              <Route path="/medical-records/:id" element={<RecordDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
