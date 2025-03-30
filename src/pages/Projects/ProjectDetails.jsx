import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../styles/Projects/ProjectDetails.css';
import { url, url2} from '../../lib/api';
import { MdDelete } from "react-icons/md";
import { FaEye, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };
  
  const updateItem = async (item) => {
    try {
      await axios.put(`${url}/items/project-items/${item.id}`, item);
      toast.success("Item updated!");
    } catch (err) {
      toast.error("Error updating item.");
      console.error(err);
    }
  };
  
  const deleteItem = async (id) => {
    try {
      await axios.delete(`${url}/items/project-items/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted!");
    } catch (err) {
      toast.error("Error deleting item.");
      console.error(err);
    }
  };
  
  const addNewItemToBackend = async (item, index) => {
    try {
      const res = await axios.post(`${url}/items/project-items`, item);
      const updated = [...items];
      updated[index] = res.data;
      setItems(updated);
      alert("Item added!");
    } catch (err) {
      alert("Failed to add item.");
      console.error(err);
    }
  };
  
  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        itemName: '',
        quantity: '',
        expectedDeliveryDate: '',
        status: 'Pending',
        projectId,
      }
    ]);
  };
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${url}/items/${projectId}/`);
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
          axios.get(`${url}/projects/${projectId}`),
          axios.get(`${url}/auth/getAllUsers`)
        ]);

        const fetchedProject = projectRes.data;
        const fetchedUsers = usersRes.data;

        fetchedProject.assignedTeamRoles = Array.isArray(fetchedProject.assignedTeamRoles)
          ? fetchedProject.assignedTeamRoles
          : JSON.parse(fetchedProject.assignedTeamRoles || '[]');

          fetchedProject.proposals = Array.isArray(fetchedProject.proposals)
          ? fetchedProject.proposals
          : JSON.parse(fetchedProject.proposals || '[]');
        
        fetchedProject.floorPlans = Array.isArray(fetchedProject.floorPlans)
          ? fetchedProject.floorPlans
          : JSON.parse(fetchedProject.floorPlans || '[]');
        
        fetchedProject.otherDocuments = Array.isArray(fetchedProject.otherDocuments)
          ? fetchedProject.otherDocuments
          : JSON.parse(fetchedProject.otherDocuments || '[]');
        

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
  const removeRow = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <Layout>
      <div className='project-details-page'>
      <div className="project-details-header">
        <h1>{project.name}</h1>
        <p className="project-subtitle">{project.type} Project</p>
      </div>

      <div className="tabs">
        {['overview', 'documents', 'team', 'items', 'settings'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="project-details-container">
            <div className="project-info-card">
              <h2>Project Overview</h2>
              <div className="info-group"><strong>Client:</strong> {project.clientName}</div>
              <div className="info-group"><strong>Status:</strong> {project.status}</div>
              <div className="info-group"><strong>Description:</strong> {project.description || "N/A"}</div>
              <div className="info-group"><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</div>
              <div className="info-group"><strong>Estimated Completion:</strong> {new Date(project.estimatedCompletion).toLocaleDateString()}</div>
              <div className="info-group"><strong>Total Value:</strong> ₹ {project.totalValue?.toLocaleString() || "N/A"}</div>
            </div>
            <div className="project-info-card">
              <h2>Delivery Details</h2>
              <div className="info-group"><strong>Address:</strong> {project.deliveryAddress || "N/A"}</div>
              <div className="info-group"><strong>Hours:</strong> {project.deliveryHours || "N/A"}</div>
            </div>
          </div>
        )}
{activeTab === 'documents' && (
  <div className="project-info-card">
    <h2>Uploaded Documents</h2>

    {[
      { title: "Proposals & Presentations", files: project.proposals },
      { title: "Floor Plans & CAD Files", files: project.floorPlans },
      { title: "Other Documents", files: project.otherDocuments },
    ].map((docCategory, idx) => (
      <div key={idx} className="document-section">
        <h3>{docCategory.title}</h3>
        {docCategory.files?.length > 0 ? (
          <div className="uploaded-files">
            {docCategory.files.map((url, idx) => {
              const fileName = url.split('/').pop();
              const fileUrl = url.startsWith('uploads') ? `${url2}/${url}` : url;

              const handleDownload = async () => {
                try {
                  const response = await fetch(fileUrl);
                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = fileName;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                  console.error("Download failed", error);
                  alert("Download failed, please try again.");
                }
              };

              return (
                <div key={idx} className="file-item-enhanced">
                  <span className="file-name-enhanced">{fileName}</span>
                  <div className="file-actions">
                    <button
                      className="file-action-btn"
                      onClick={() => window.open(fileUrl, '_blank')}
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="file-action-btn"
                      onClick={handleDownload}
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No documents uploaded.</p>
        )}
      </div>
    ))}
  </div>
)}



{activeTab === 'team' && (
  <div className="project-info-card">
    <h2>Assigned Team</h2>
    {project.assignedTeamRoles.length > 0 ? (
      <div className="team-grid">
        {project.assignedTeamRoles.map((roleGroup, index) => (
          <div key={index} className="role-card">
            <h3 className="role-title">{roleGroup.role}</h3>
            {roleGroup.users.map((userId) => {
              const user = allUsers.find(u => u.id.toString() === userId.toString());
              return user ? (
                <div key={user.id} className="user-card-horizontal">
                  <img 
                    src={user.profileImage ? `${url2}/${user.profileImage}` : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
                    alt={`${user.firstName} ${user.lastName}`} 
                    className="user-profile-img-horizontal" 
                  />
                  <div className="user-info-horizontal">
                    <span className="user-name-horizontal">{user.firstName} {user.lastName}</span>
                    <span className="user-email-horizontal">{user.email}</span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ))}
      </div>
    ) : (
      <p>No team assigned.</p>
    )}
  </div>
)}




{activeTab === 'items' && (
  <div className="project-info-card">
    <h2>Project Lead Time Matrix</h2>
    <table className="matrix-table">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Expected Delivery</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id || index}>
            <td>
              <input
                value={item.itemName}
                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
              />
            </td>
            <td>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
            </td>
            <td>
              <input
                type="date"
                value={item.expectedDeliveryDate?.slice(0, 10) || ''}
                onChange={(e) => handleItemChange(index, 'expectedDeliveryDate', e.target.value)}
              />
            </td>
            <td>
              <select
                value={item.status}
                onChange={(e) => handleItemChange(index, 'status', e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Installed">Installed</option>
              </select>
            </td>
            <td>
            {item.id ? (
  <>
    <button onClick={() => deleteItem(item.id)}><MdDelete/></button>
  </>
) : (
  <>
    <button onClick={() => addNewItemToBackend(item, index)}>Save</button>
    <button onClick={() => removeRow(index)}>Remove Row</button>
  </>
)}

</td>

          </tr>
        ))}
      </tbody>
    </table>
    <div className='button1' style={{ display: 'flex', justifyContent: 'space-between' }}>
  <button className="ledbutton" onClick={handleAddItemRow}>+ Add Row</button>
  <button className="ledbutton" onClick={() => {
    items.forEach(item => {
      if (item.id) updateItem(item);
    });
  }}>Save</button>
</div>

   
  </div>
)}


        {activeTab === 'settings' && (
          <div className="project-info-card">
            <h2>Settings</h2>
            <div className="info-group"><strong>Client View:</strong> {project.allowClientView ? "Allowed" : "Disabled"}</div>
            <div className="info-group"><strong>Comments:</strong> {project.allowComments ? "Allowed" : "Disabled"}</div>
            <div className="info-group"><strong>Email Notifications:</strong> {project.enableNotifications ? "Allowed" : "Disabled"}</div>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default ProjectDetails;    