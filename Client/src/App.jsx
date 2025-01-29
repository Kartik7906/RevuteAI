import Dashboard from "./Components/Dashboard/Dashboard";
import LoginPage from "./Components/Login/LoginPage"
import RegisterPage from "./Components/Register/RegisterPage"
import LandingPage from "./Components/LandingPage/LandingPage"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReportPage from "./Components/ReportPage/ReportPage";
import HomePage from "./Components/HomePage/HomePage";
import Task1 from "./Components/Task1/Task1";
import ListedReport from "./Components/ListedReports/ListedReport";
import BotPage from "./Components/BotPage/BotPage";
import Admin from "./Components/AdminDashboard/Admin";
import SuperAdmin from "./Components/SuperAdmin/SuperAdmin";
import ContactusPage from "./Components/ContactusPage/ContactusPage";
import Education from "./Components/Education/Education";
import LearnMore from "./Components/LearnMore/LearnMore";
import RequestDemo from "./Components/RequestDemo/RequestDemo";
import Announcement from "./Components/Announcement/Announcement";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/announcement" element={<Announcement/>} />
          <Route path="/report" element={<ReportPage/>} />
          <Route path="/task1" element={<Task1/>} />
          <Route path="/reportlist/:userId" element={<ListedReport/>} />
          <Route path="/botpage" element={<BotPage/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/superadmin" element={<SuperAdmin/>} />
          <Route path="/contactus" element={<ContactusPage/>} />
          <Route path="/education" element={<Education/>} />
          <Route path="/learnmore" element={<LearnMore/>} />
          <Route path="/requestdemo" element={<RequestDemo/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
