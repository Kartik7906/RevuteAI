import React from 'react'
import { Link } from 'react-router-dom'
import './SideBar.css'
import { MdOutlineDashboard } from "react-icons/md";
import { GrAnnounce } from "react-icons/gr";
import { MdOutlineTaskAlt } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setSection }) => {
  const navigate = useNavigate();
  const handleReportBtn = () =>{
    setSection('report')
    navigate('/report')
  }
  
  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => setSection('dashboard')}><MdOutlineDashboard size={20}/> Dashboard</li>
        <li onClick={() => setSection('announcements')}><GrAnnounce size={20}/> Announcements</li>
        <li onClick={() => setSection('task1')}> <MdOutlineTaskAlt size={20}/> Task1</li>
        <li onClick={() => setSection('task2')}> <MdOutlineTaskAlt size={20}/> Task2</li>
        
        <li onClick={handleReportBtn}>
          <TbReportSearch size={20} /> Report
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
