import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SideBar.css';
import { MdOutlineDashboard } from "react-icons/md";
import { GrAnnounce } from "react-icons/gr";
// import { MdOutlineTaskAlt } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { MdCastForEducation } from "react-icons/md";
import { TbVocabulary } from "react-icons/tb";
import { LuBot } from "react-icons/lu";
import { MdLeaderboard } from "react-icons/md";

const Sidebar = ({ setSection }) => {
  const navigate = useNavigate();

  // const handleIntroNavigation = () => {
  //   setSection('task1');
  //   navigate('/task1');
  // };

  const isMobile = window.innerWidth <= 992;
  const handleNavigationformobile = (section, route) => {
    setSection(section);
    if (isMobile) {
      navigate(route);
    }
  };

  const handleReportListNavigation = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setSection('reportlist');
      navigate(`/reportlist/${userId}`); 
    } else {
      alert("Please Login First");
    }
  };

  const handleEducationNavigation = () => {
    const userId = localStorage.getItem('userId');
    if(userId){
      setSection('education');
      navigate('/elearning');
      // navigate(`/modules/${userId}`);
    }
    else{
      alert("Please Login First");
    }
  };
  
  const handleLeaderboardNavigation = () =>{
    navigate("/leaderboard")
  }

  // onClick={handleIntroNavigation}
  // onClick={() => setSection('task2')}

  return (
    <nav className="sidebar">
      <ul>
        <li onClick={() => handleNavigationformobile('dashboard', '/dashboard')}><MdOutlineDashboard size={20}/> Home Page</li>
        <li onClick={() => handleNavigationformobile('announcements', '/announcement')}><GrAnnounce size={20}/> Announcements</li>
        <li onClick={handleEducationNavigation}><MdCastForEducation size={20}/> Courses</li>
        <li onClick={handleLeaderboardNavigation}><MdLeaderboard size={20}/> Leaderboard</li>
        <li ><TbVocabulary size={20}/> Self Intro Pitch</li>
        <li ><LuBot size={20}/> Bot Mock Pitch</li>
        <li onClick={handleReportListNavigation}><TbReportSearch size={20}/> Report</li>
      </ul>
    </nav>
  );
};

export default Sidebar;