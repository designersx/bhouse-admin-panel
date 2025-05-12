import React from 'react'
import { useNavigate } from 'react-router-dom';
import "../../styles/dashboard.css";
const NoProject = () => {
    const navigate = useNavigate();
  return (
    <div>
      <div className="no-projects-modal-overlay">
    <div className="no-projects-modal">
      <h2>🚧 No Projects Yet</h2>
      <p>You haven’t created any projects. Let’s get started!</p>
      <button onClick={() => navigate("/add-projects")} className="create-btn">
        + Create Project
      </button>
    </div>
  </div>
    </div>
  )
}

export default NoProject
