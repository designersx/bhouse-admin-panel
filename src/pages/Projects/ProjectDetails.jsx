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
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${projectId}/`);
        setItems(res.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
  
    fetchItems();
  }, [projectId]);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [projectRes, usersRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/projects/${projectId}`),
          axios.get(`http://localhost:5000/api/auth/getAllUsers`)
        ]);

        const fetchedProject = projectRes.data;
        const fetchedUsers = usersRes.data;

        fetchedProject.assignedTeamRoles = Array.isArray(fetchedProject.assignedTeamRoles)
          ? fetchedProject.assignedTeamRoles
          : JSON.parse(fetchedProject.assignedTeamRoles || '[]');

        fetchedProject.fileUrls = Array.isArray(fetchedProject.fileUrls)
          ? fetchedProject.fileUrls
          : JSON.parse(fetchedProject.fileUrls || '[]');

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
    if (!Array.isArray(ids)) return "No users assigned";
    return ids
      .map(id => {
        const user = allUsers.find(u => u.id.toString() === id.toString());
        return user ? `${user.firstName} ${user.lastName}` : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  if (loading) {
    return (
      <Layout>
        <div className="project-details-header">
          <h1>Project Details</h1>
        </div>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="project-details-header">
        <h1>{project.name}</h1>
        <p className="project-subtitle">{project.type} Project</p>
      </div>

      <div className="project-details-container">

        {/* Project Info */}
        <div className="project-info-card">
          <h2>Project Overview</h2>
          <div className="info-group"><strong>Client:</strong> {project.clientName}</div>
          <div className="info-group"><strong>Status:</strong> {project.status}</div>
          <div className="info-group"><strong>Description:</strong> {project.description || "N/A"}</div>
          <div className="info-group"><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</div>
          <div className="info-group"><strong>Estimated Completion:</strong> {new Date(project.estimatedCompletion).toLocaleDateString()}</div>
          <div className="info-group"><strong>Total Value:</strong> ₹ {project.totalValue?.toLocaleString() || "N/A"}</div>
        </div>

        {/* Delivery Info */}
        <div className="project-info-card">
          <h2>Delivery Details</h2>
          <div className="info-group"><strong>Address:</strong> {project.deliveryAddress || "N/A"}</div>
          <div className="info-group"><strong>Hours:</strong> {project.deliveryHours || "N/A"}</div>
        </div>

        {/* Team Info */}
        <div className="project-info-card">
          <h2>Assigned Team</h2>
          {project.assignedTeamRoles.length > 0 ? (
            project.assignedTeamRoles.map((roleGroup, index) => (
              <div key={index} className="info-group">
                <strong>{roleGroup.role}:</strong>
                <span> {getUserNamesByIds(roleGroup.users)}</span>
              </div>
            ))
          ) : (
            <p>No team assigned.</p>
          )}
        </div>
        {/*Item info*/ }
        <div className="project-info-card">
  <h2>Project Lead Time Matrix</h2>
  {items.length > 0 ? (
    <table className="matrix-table">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Expected Delivery</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx}>
            <td>{item.itemName}</td>
            <td>{item.quantity}</td>
            <td>{new Date(item.expectedDeliveryDate).toLocaleDateString()}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No items added to this project.</p>
  )}
</div>

        {/* File Info */}
        {project.fileUrls.length > 0 && (
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

        {/* Settings */}
        <div className="project-info-card">
          <h2>Settings</h2>
          <div className="info-group"><strong>Client View:</strong> {project.allowClientView ? "Enabled" : "Disabled"}</div>
          <div className="info-group"><strong>Comments:</strong> {project.allowComments ? "Allowed" : "Disabled"}</div>
          <div className="info-group"><strong>Email Notifications:</strong> {project.enableNotifications ? "Enabled" : "Disabled"}</div>
        </div>

      </div>
    </Layout>
  );
};

export default ProjectDetails;
