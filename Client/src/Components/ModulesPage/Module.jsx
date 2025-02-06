import React, { useState } from "react";
import "./Module.css";
import company_logo from "../../images/company_logo.jpeg";
import { useNavigate } from "react-router-dom";

const Module = () => {
  const modulesData = [
    {
      id: 1,
      title: "Module 1",
      description: "Communication Module",
      moduleContent:
        "Overview for Module 1. This module includes multiple reading sections, practice material, and MCQs related to communication skills.",
      subItems: [
        { name: "Reading Content 1", content: "Reading content 1 details..." },
        { name: "Reading Content 2", content: "Reading content 2 details..." },
        { name: "Practice Section", content: "Practice section details..." },
      ],
    },
    {
      id: 2,
      title: "Module 2",
      description: "Soft Skill Module",
      moduleContent:
        "Overview for Module 2. This module focuses on key soft skills required in professional settings.",
      subItems: [
        { name: "Reading Content 1", content: "Reading content 1 details..." },
        { name: "Reading Content 2", content: "Reading content 2 details..." },
        { name: "Practice Section", content: "Practice section details..." },
      ],
    },
    {
      id: 3,
      title: "Module 3",
      description: "Basic Bfsi Module",
      moduleContent:
        "Overview for Module 3. This module introduces basic BFSI concepts, industry insights, and foundational knowledge.",
      subItems: [
        { name: "Reading Content 1", content: "Reading content 1 details..." },
        { name: "Reading Content 2", content: "Reading content 2 details..." },
        { name: "Practice Section", content: "Practice section details..." },
      ],
    },
    {
      id: 4,
      title: "Module 4",
      description: "Products Details Module",
      moduleContent:
        "Overview for Module 4. This module covers different products and their detailed specifications.",
      subItems: [
        { name: "Reading Content 1", content: "Reading content 1 details..." },
        { name: "Reading Content 2", content: "Reading content 2 details..." },
        { name: "Practice Section", content: "Practice section details..." },
      ],
    },
    {
      id: 5,
      title: "Module 5",
      description: "Sales Skill Module",
      moduleContent:
        "Overview for Module 5. This module focuses on important sales skills, handling objections, and conversions.",
      subItems: [
        { name: "Reading Content 1", content: "Reading content 1 details..." },
        { name: "Reading Content 2", content: "Reading content 2 details..." },
        { name: "Practice Section", content: "Practice section details..." },
      ],
    },
    {
      id: 6,
      title: "Module 6",
      description: "Negotiation Module",
      moduleContent:
        "Overview for Module 6. This module explores negotiation strategies, techniques, and best practices.",
      subItems: [
        { name: "Reading Content 1", content: "Reading content 1 details..." },
        { name: "Reading Content 2", content: "Reading content 2 details..." },
        { name: "Practice Section", content: "Practice section details..." },
      ],
    },
  ];

  const navigate = useNavigate();

  const [expandedModule, setExpandedModule] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState("");
  const [completedModules, setCompletedModules] = useState({});
  const [isAllModuleCompleted, setIsAllModuleCompleted] = useState(false);

  const handleModuleClick = (moduleId) => {
    const newExpandedModule = expandedModule === moduleId ? null : moduleId;
    setExpandedModule(newExpandedModule);
    if (newExpandedModule === moduleId) {
      setSelectedModule(moduleId);
      setSelectedSubItem("");
    } else {
      setSelectedModule(null);
      setSelectedSubItem("");
    }
  };

  const handleSubItemClick = (moduleId, subItemName) => {
    setSelectedModule(moduleId);
    setSelectedSubItem(subItemName);
  };

  const markModuleAsCompleted = (moduleId) => {
    setCompletedModules({ ...completedModules, [moduleId]: true });
  };

  const currentModuleData = modulesData.find((m) => m.id === selectedModule);

  let contentToShow = "";
  if (currentModuleData) {
    if (selectedSubItem) {
      const subItemObject = currentModuleData.subItems.find(
        (s) => s.name === selectedSubItem
      );
      contentToShow = subItemObject ? subItemObject.content : "";
    } else {
      contentToShow = currentModuleData.moduleContent;
    }
  }

  const handleLogoutbtn = () => {
    localStorage.clear();
    navigate("/");
  };

  const breadcrumb = () => {
    if (!currentModuleData) return "";
    if (selectedSubItem) {
      return `${currentModuleData.title} >> ${selectedSubItem}`;
    }
    return `${currentModuleData.title}`;
  };

  return (
    <div className="ModulePage-MainContainer">
      <div className="ModulePage-elements">
        <nav className="ModulePage-Navbar">
          <div className="CompanyLogo-Here" onClick={() => navigate("/")}>
            <img src={company_logo} alt="" />
          </div>
          <div className="ModulePageNavbar-rightsection">
            <button className="Logout-btn-design" onClick={handleLogoutbtn}>
              Logout
            </button>
            <div
              className="ModulePageNavbar-circulardiv"
              onClick={() => navigate("/profile")}
            />
          </div>
        </nav>
        <div className="ModulePage-middleSection">
          <div className="Modulepage-sidebar">
            <div className="ModulesSection">Modules</div>
            <ul>
              {modulesData.map((module) => (
                <li key={module.id}>
                  <div
                    className="ModuleItem"
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <div>
                      <div className="Modulepage-sidebaritem">
                        {module.title}
                      </div>
                      <p>{module.description}</p>
                    </div>
                    <div
                      className={
                        completedModules[module.id]
                          ? "ModuleCompletionIndicator completed"
                          : "ModuleCompletionIndicator"
                      }
                    />
                  </div>
                  {expandedModule === module.id && (
                    <ul className="ModuleSubItems">
                      {module.subItems.map((sub, index) => (
                        <li
                          key={index}
                          onClick={() => handleSubItemClick(module.id, sub.name)}
                        >
                          {sub.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="ModulePage-sidebar-visibleArea">
            <div className="ModulePage-track-folderStructure">
              {breadcrumb()}
            </div>
            <div className="ModulePage-module-contentArea">
              {selectedModule && (
                <>
                  <h2>{currentModuleData?.title}</h2>
                  <p>{contentToShow}</p>
                  <button
                    onClick={() => markModuleAsCompleted(selectedModule)}
                    disabled={!!completedModules[selectedModule]}
                  >
                    {completedModules[selectedModule]
                      ? "Module Completed"
                      : "Complete this Module"}
                  </button>
                </>
              )}

              {
                isAllModuleCompleted && (
                    <>
                        <div className="ModulePagenextStep">
                            <h2>Congrats you have unlock next step after passing all modules successully</h2>
                            <p>what would be the next step:</p>
                            <p>ready to interect with botai</p>
                            <p>take you next step</p>
                            <button onClick={()=>navigate("/task1")}>Next Step</button>
                        </div>
                    </>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module;
