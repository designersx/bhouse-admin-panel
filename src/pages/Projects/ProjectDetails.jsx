import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 
import '../../styles/Projects/ProjectDetails.css'; 
const ProjectDetails = () => {
  const { projectId } = useParams(); 
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project details using the project ID
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
        const fetchedProject = response.data;

        // Ensure that assignedTeamRoles is an array
        if (typeof fetchedProject.assignedTeamRoles === 'string') {
          fetchedProject.assignedTeamRoles = JSON.parse(fetchedProject.assignedTeamRoles || '[]');
        }

        setProject(fetchedProject);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

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

          <div className="project-info-card">
            <h2>Roles & Permissions</h2>
            <div className="info-group">
              <strong>Assigned Team Roles: </strong>
              <span>{project.assignedTeamRoles.join(", ")}</span>
            </div>
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
