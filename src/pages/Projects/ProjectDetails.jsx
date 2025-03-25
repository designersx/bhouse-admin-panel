import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 
import '../../styles/Projects/ProjectDetails.css'; 
const ProjectDetails = () => {
  const { projectId } = useParams(); 
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [projectRes, usersRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/projects/${projectId}`),
          axios.get(`http://localhost:5000/api/auth/getAllUsers`)
        ]);
  
        const fetchedProject = projectRes.data;
        const fetchedUsers = usersRes.data;
  
        if (typeof fetchedProject.assignedTeamRoles === 'string') {
          fetchedProject.assignedTeamRoles = JSON.parse(fetchedProject.assignedTeamRoles || '[]');
        }
  
        if (typeof fetchedProject.fileUrls === 'string') {
          fetchedProject.fileUrls = JSON.parse(fetchedProject.fileUrls || '[]');
        }
  
        setProject(fetchedProject);
        setAllUsers(fetchedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };
  
    fetchProjectDetails();
  }, [projectId]);
  const getUserNamesByIds = (ids) => {
    if (!Array.isArray(ids)) return "";
    return ids
      .map(id => {
        const user = allUsers.find(u => u.id.toString() === id.toString());
        return user ? `${user.firstName} ${user.lastName}` : null;
      })
      .filter(Boolean)
      .join(", ");
  };
  
  

  return (
    <Layout>
      <div className="project-details-header">
        <h1>Project Details</h1>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="project-details-container">
          <div className="project-info-card">
            <h2>Project Information</h2>
            <div className="info-group">
              <strong>Project Name: </strong>
              <span>{project.name}</span>
            </div>
            <div className="info-group">
              <strong>Client Name: </strong>
              <span>{project.clientName}</span>
            </div>
            <div className="info-group">
              <strong>Status: </strong>
              <span>{project.status}</span>
            </div>
            <div className="info-group">
              <strong>Description: </strong>
              <p>{project.description}</p>
            </div>
            <div className="info-group">
              <strong>Start Date: </strong>
              <span>{new Date(project.startDate).toLocaleDateString()}</span>
            </div>
            <div className="info-group">
              <strong>Estimated Completion: </strong>
              <span>{new Date(project.estimatedCompletion).toLocaleDateString()}</span>
            </div>
          </div>
          {project.fileUrls && project.fileUrls.length > 0 && (
  <div className="project-info-card">
    <h2>Uploaded Files</h2>
    <div className="uploaded-files">
      {project.fileUrls.map((url, idx) => {
        const fileName = url.split('/').pop();
        const fileExt = fileName.split('.').pop().toLowerCase();
        const fileUrl = url.startsWith('uploads') ? `http://localhost:5000/${url}` : url;

        return (
          <div key={idx} className="file-item">
            {['jpg', 'jpeg', 'png'].includes(fileExt) ? (
              <img src={fileUrl} alt={fileName} className="file-preview-image" />
            ) : (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                {fileName}
              </a>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

<div className="project-info-card">
  <h2>Assigned Team</h2>
  {Array.isArray(project.assignedTeamRoles) && project.assignedTeamRoles.map((roleGroup, index) => (
    <div key={index} className="info-group">
      <strong>{roleGroup.role}:</strong>
      <span> {getUserNamesByIds(roleGroup.users)}</span>
    </div>
  ))}
</div>



          <div className="project-info-card">
            <h2>Additional Settings</h2>
            <div className="info-group">
              <strong>Allow Client View: </strong>
              <span>{project.allowClientView ? "Yes" : "No"}</span>
            </div>
            <div className="info-group">
              <strong>Allow Comments: </strong>
              <span>{project.allowComments ? "Yes" : "No"}</span>
            </div>
            <div className="info-group">
              <strong>Enable Notifications: </strong>
              <span>{project.enableNotifications ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="project-info-card">
            <h2>Delivery Details</h2>
            <div className="info-group">
              <strong>Delivery Address: </strong>
              <span>{project.deliveryAddress}</span>
            </div>
            <div className="info-group">
              <strong>Delivery Hours: </strong>
              <span>{project.deliveryHours}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetails;
