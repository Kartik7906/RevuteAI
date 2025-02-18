import Dashboard from "./Components/Dashboard/Dashboard";
import LandingPage from "./Components/LandingPage/LandingPage"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReportPage from "./Components/ReportPage/ReportPage";
import HomePage from "./Components/HomePage/HomePage";
import Task1 from "./Components/Task1/Task1";
import ListedReport from "./Components/ListedReports/ListedReport";
import BotPage from "./Components/BotPage/BotPage";
import Admin from "./Components/AdminDashboard/Admin";
import SuperAdmin from "./Components/SuperAdmin/SuperAdmin";
import LearnMore from "./Components/LearnMore/LearnMore";
import RequestDemo from "./Components/RequestDemo/RequestDemo";
import Announcement from "./Components/Announcement/Announcement";
import ProfilePage from "./Components/ProfilePage/ProfilePage";
import Credentials from "./Components/CredentialsPage/Credentials";
import Module from "./Components/ModulesPage/Module";
import Leaderboard from "./Components/LeaderBoard/Leaderboard";
import Elearning from "./Components/ElearningPage/Elearning";
import TrainigPage from "./TrainingDashboard/RoleplayPage/TrainigPage";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/announcement" element={<Announcement/>} />
          <Route path="/report" element={<ReportPage/>} />
          <Route path="/task1" element={<Task1/>} />
          <Route path="/reportlist/:userId" element={<ListedReport/>} />
          <Route path="/botpage" element={<BotPage/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/superadmin" element={<SuperAdmin/>} />
          <Route path="/learnmore" element={<LearnMore/>} />
          <Route path="/requestdemo" element={<RequestDemo/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/creditianls" element={<Credentials/>} />
          <Route path="/modules/:userId" element={<Module/>}/>
          <Route path="/leaderboard" element={<Leaderboard/>} />
          <Route path="/elearning" element={<Elearning/>} />
          <Route path="/userTraining" element={<TrainigPage/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
