import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Projects/ProjectDetails.css';
import { url, url2} from '../../lib/api';

import Swal from 'sweetalert2';

import { ToastContainer } from 'react-toastify';
import { MdDelete } from "react-icons/md";
import { FaEye, FaComment  ,  FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import BackButton from '../../components/BackButton';
import { MdEdit } from 'react-icons/md';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [editableRows, setEditableRows] = useState({});
  const [punchList, setPunchList] = useState([]);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({
    proposals: [],
    floorPlans: [],
    otherDocuments: []
  });
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    issueDescription: '',
    projectItemId: '',
    productImages: [],
  });
  const [projectItems, setProjectItems] = useState([]);
  useEffect(() => {
    axios.get(`${url}/items/${projectId}`)
      .then(res => setProjectItems(res.data))
      .catch(err => console.error("Failed to load items:", err));
  }, [projectId]);
  
  useEffect(() => {
    const fetchPunchList = async () => {
      try {
        const res = await axios.get(`${url}/projects/${projectId}/punch-list`);
        const parsed = res.data.map(issue => ({
          ...issue,
          productImages: typeof issue.productImages === 'string'
            ? JSON.parse(issue.productImages)
            : Array.isArray(issue.productImages)
            ? issue.productImages
            : []
        }));
        setPunchList(parsed);
        const initialStatus = {};
        parsed.forEach(item => {
          initialStatus[item.id] = item.status || 'Pending';
        });
        setStatusMap(initialStatus);
      } catch (err) {
        console.error("Error fetching punch list:", err);
      }
    };
    
  
    fetchPunchList();
  }, [projectId]);
  

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
  
    if (field === 'itemName' && !/^[a-zA-Z\s]*$/.test(value)) return; 
    if (field === 'quantity' && !/^\d*$/.test(value)) return; 
  
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
      toast.success("Item added!");
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
  const handleFileUpload = (e, category) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => ({
      ...prev,
      [category]: [...prev[category], ...files]
    }));
  };
  const removeSelectedFile = (category, index) => {
    setSelectedFiles(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };
  const uploadSelectedFiles = async (category) => {
    if (!selectedFiles[category].length) return;
  
    const formData = new FormData();
    selectedFiles[category].forEach(file => formData.append('files', file));
    formData.append('category', category);
  
    try {
      await axios.post(`${url}/projects/${projectId}/upload-files?category=${category}`, formData);
      toast.success("Files uploaded!");
  
      // Clear selected files
      setSelectedFiles(prev => ({ ...prev, [category]: [] }));
  
      // Refresh project data
      const res = await axios.get(`${url}/projects/${projectId}`);
      setProject(res.data);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed.");
    }
  };
    
  
  const handleProjectFileUpdate = async (filePath, category) => {
    const updatedCategoryFiles = project[category].filter(f => f !== filePath);
    const updatedProject = {
      ...project,
      [category]: updatedCategoryFiles
    };
  
    const formDataToSend = new FormData();
    formDataToSend.append("removedFiles", JSON.stringify([filePath]));
  
    // Append basic fields (add more if required)
    ['name', 'type', 'clientName', 'description', 'startDate', 'estimatedCompletion', 'totalValue', 'deliveryAddress', 'deliveryHours'].forEach(key => {
      if (updatedProject[key] !== undefined) {
        formDataToSend.append(key, updatedProject[key]);
      }
    });
  
    try {
      const res = await fetch(`${url}/projects/${projectId}`, {
        method: 'PUT',
        body: formDataToSend
      });
  
      if (res.status === 200) {
        setProject(prev => ({
          ...prev,
          [category]: updatedCategoryFiles
        }));
        toast.success("File removed and project updated!");
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to update project.");
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Error while updating project.");
    }
  };
  const toggleEditRow = (index) => {
    setEditableRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const handlePunchStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${url}/punch-list/${id}/status`, { status });
      toast.success("Punch List status updated!");
  
      // Refresh punch list after update
      const res = await axios.get(`${url}/projects/${projectId}/punch-list`);
      const parsed = res.data.map(issue => ({
        ...issue,
        productImages: typeof issue.productImages === 'string'
          ? JSON.parse(issue.productImages)
          : Array.isArray(issue.productImages)
          ? issue.productImages
          : []
      }));
      setPunchList(parsed);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update punch list status.");
    }
  };
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = [...newIssue.productImages, ...files];
  
    if (totalFiles.length > 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }
  
    setNewIssue((prev) => ({
      ...prev,
      productImages: totalFiles,
    }));
  };
  const removeImage = (index) => {
    setNewIssue((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };
    
  return (
    <Layout>
      <ToastContainer/>
      <div className='project-details-page'>
        <BackButton/>
      <div className="project-details-header">
        <h1>{project.name}</h1>
        <p className="project-subtitle">{project.type} Project</p>
      </div>

      <div className="tabs">
        {['overview', 'documents', 'team', 'items', 'punchlist','settings'].map(tab => (
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
  { title: "Proposals & Presentations", files: project.proposals, category: 'proposals' },
  { title: "Floor Plans & CAD Files", files: project.floorPlans, category: 'floorPlans' },
  { title: "Other Documents", files: project.otherDocuments, category: 'otherDocuments' },
]


.map((docCategory, idx) => (
      <div key={idx} className="document-section">
        <h3>{docCategory.title}</h3>
        <input
      type="file"
      multiple
      onChange={(e) => handleFileUpload(e, docCategory.category)}
    />
     {selectedFiles[docCategory.category]?.length > 0 && (
    <div className="file-preview-section">
      <h4>Files to be uploaded:</h4>
      <ul className="preview-list">
        {selectedFiles[docCategory.category].map((file, i) => (
          <li key={i} className="preview-item">
            {file.name}
            <span className="remove-preview" onClick={() => removeSelectedFile(docCategory.category, i)}>×</span>
          </li>
        ))}
      </ul>
      <button className="upload-btn" onClick={() => uploadSelectedFiles(docCategory.category)}>Upload</button>
    </div>
  )}
 {(() => {
  const files = Array.isArray(docCategory.files)
    ? docCategory.files
    : typeof docCategory.files === 'string'
      ? JSON.parse(docCategory.files)
      : [];

  return files.length > 0 ? (
    <div className="uploaded-files">
      {files.map((filePath, idx) => {
        const fileName = filePath.split('/').pop();
        const fileUrl = filePath.startsWith('uploads') ? `${url2}/${filePath}` : filePath;

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
              <button className="file-action-btn" onClick={() => window.open(fileUrl, '_blank')} title="View">
                <FaEye />
              </button>
              <button className="file-action-btn" onClick={handleDownload} title="Download">
                <FaDownload />
              </button>
              <button
                className="file-action-btn"
                title="Delete"
                onClick={() => {
                  Swal.fire({
                    title: 'Are you sure?',
                    text: "Do you want to remove this file?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, remove it!',
                    cancelButtonText: 'Cancel',
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      await handleProjectFileUpdate(filePath, docCategory.category);
                    }
                  });
                }}
              >
                <MdDelete />
              </button>
              <button 
                className="file-action-btn"
                title="Comment"
                onClick={() => navigate(`/project/${projectId}/file-comments`, {
                  state: {
                    filePath,
                    category: docCategory.category,
                  }
                })}
              >
                <FaComment />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p>No documents uploaded.</p>
  );
})()}

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
  {items.map((item, index) => {
    const isEditable = editableRows[index] || !item.id; 

    const handleSave = () => {
      if (!item.itemName || !item.quantity || !item.expectedDeliveryDate || !item.status) {
        return toast.error("All fields are required.");
      }
    
      if (!/^[a-zA-Z\s]*$/.test(item.itemName)) {
        return toast.error("Item Name must contain only letters.");
      }
    
      if (!/^\d+$/.test(item.quantity)) {
        return toast.error("Quantity must be a number.");
      }
    
      if (item.id) {
        updateItem(item);
      } else {
        addNewItemToBackend(item, index);
      }
    
      // ✅ After saving, disable the row
      setEditableRows(prev => ({ ...prev, [index]: false }));
    };
    

    return (
      <tr key={item.id || index}>
        <td>
          <input
            value={item.itemName}
            disabled={!isEditable}
            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            value={item.quantity}
            disabled={!isEditable}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
          />
        </td>
        <td>
          <input
            type="date"
            value={item.expectedDeliveryDate?.slice(0, 10) || ''}
            disabled={!isEditable}
            onChange={(e) => handleItemChange(index, 'expectedDeliveryDate', e.target.value)}
          />
        </td>
        <td>
          <select
            value={item.status}
            disabled={!isEditable}
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
            isEditable ? (
              <button onClick={handleSave}>Save</button>
            ) : (
              <>
                <button onClick={() => toggleEditRow(index)}><MdEdit /></button>
                <button onClick={() => deleteItem(item.id)}><MdDelete /></button>
              </>
            )
          ) : (
            <>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => removeRow(index)}>Remove</button>
            </>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

    </table>
    <div className='button1' style={{ display: 'flex', justifyContent: 'space-between' }}>
  <button className="ledbutton" onClick={handleAddItemRow}>+ Add Row</button>
</div>

   
  </div>
)}
{activeTab === 'punchlist' && (
  <div className="project-info-card">
    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
  <button className="ledbutton" onClick={() => setShowPunchModal(true)}>
    + Add
  </button>
</div>
{showPunchModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Add Punch List Issue</h3>
      <label>Title</label>
      <input
        value={newIssue.title}
        onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
        maxLength={30}
      />

      <label>Description</label>
      <textarea
        value={newIssue.issueDescription}
        onChange={(e) => setNewIssue({ ...newIssue, issueDescription: e.target.value })}
        minLength={50}
        maxLength={200}
      />

      <label>Item (Category)</label>
      <select
        value={newIssue.projectItemId}
        onChange={(e) => setNewIssue({ ...newIssue, projectItemId: e.target.value })}
      >
        <option value="">Select</option>
        {projectItems.map(item => (
          <option key={item.id} value={item.id}>{item.itemName}</option>
        ))}
      </select>

      <label>Upload Files</label>
      <input
  type="file"
  multiple
  accept="image/*"
  onChange={handleImageSelect}
/>
{newIssue.productImages.length > 0 && (
  <div className="image-preview-grid">
    {newIssue.productImages.map((img, index) => {
      const imageUrl = typeof img === 'string' ? img : URL.createObjectURL(img);

      return (
        <div key={index} className="preview-wrapper">
          <img src={imageUrl} alt={`preview-${index}`} className="preview-img" />
          <span className="remove-btn" onClick={() => removeImage(index)}>×</span>
        </div>
      );
    })}
  </div>
)}


      <div className="modal-actions">
        <button
          className="submit-btn"
          onClick={async () => {
            try {
              const formData = new FormData();
              const stored = JSON.parse(localStorage.getItem('user'));

const storedUser = stored?.user;
const storedCustomer = JSON.parse(localStorage.getItem('customer'));

let createdById = '';
let createdByType = '';

if (storedUser?.id) {
  createdById = storedUser.id;
  createdByType = 'user';
} else if (storedCustomer?.id) {
  createdById = storedCustomer.id;
  createdByType = 'customer';
} else {
  toast.error("User not logged in");
  return;
}

formData.append('createdById', createdById);
formData.append('createdByType', createdByType);

              formData.append('title', newIssue.title);
              formData.append('issueDescription', newIssue.issueDescription);
              formData.append('projectItemId', newIssue.projectItemId);
              formData.append('projectId', projectId);
              formData.append('category', projectItems.find(p => p.id == newIssue.projectItemId)?.itemName || '');
              for (let file of newIssue.productImages) {
                formData.append('productImages', file);
              }

              await axios.post(`${url}/projects/${projectId}/punch-list`, formData);
              toast.success("Issue added!");
              setShowPunchModal(false);
              setNewIssue({ title: '', issueDescription: '', projectItemId: '', productImages: [] });
              const res = await axios.get(`${url}/projects/${projectId}/punch-list`);
              setPunchList(res.data.map(issue => ({
                ...issue,
                productImages: typeof issue.productImages === 'string'
                  ? JSON.parse(issue.productImages)
                  : issue.productImages
              })));
            } catch (err) {
              console.error("Failed to add issue", err);
              toast.error("Error adding issue");
            }
          }}
        >
          Submit
        </button>
        <button className="cancel-btn" onClick={() => setShowPunchModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    <h2>Punch List</h2>

    {punchList.length === 0 ? (
      <p>No punch list issues found.</p>
    ) : (
      <div className="punch-list-grid compact-style">
      {punchList.map((issue, idx) => {
        const files = Array.isArray(issue.productImages) ? issue.productImages : [];
        const currentStatus = statusMap[issue.id] || 'Pending';
    
        return (
          <div className="punch-card-small" key={issue.id || idx}>
            <div className="punch-card-top">
              <h4>{issue.title}</h4>
              <span className={`status-badge ${issue.status?.toLowerCase() || 'pending'}`}>
  {issue.status || 'Pending'}
</span>

            </div>
    
            <div className="punch-mini-info">
              <p><strong>Item:</strong> {issue.item?.itemName || 'N/A'}</p>
              <p><strong>Description:</strong> {issue.issueDescription}</p>
            </div>
    
            {/* Status Dropdown + Update Button */}
            <div className="status-control">
              <select
                className="status-dropdown"
                value={currentStatus}
                onChange={(e) =>
                  setStatusMap((prev) => ({ ...prev, [issue.id]: e.target.value }))
                }
              >
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                className="update-status-btn"
                onClick={() => handlePunchStatusUpdate(issue.id, currentStatus)}
              >
                Save
              </button>
            </div>
    
            {/* Attachments */}
            {files.length > 0 && (
              <div className="punch-attachments">
                {files.map((file, i) => {
                  const isPDF = file.toLowerCase().endsWith('.pdf');
                  const fileUrl = `${url2}/${file}`;
                  return (
                    <div key={i} className="punch-attachment-preview">
                      {isPDF ? (
                        <iframe src={fileUrl} title={`PDF-${i}`} className="file-mini-pdf" />
                      ) : (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={fileUrl}
                          alt={`Img-${i}`}
                          className="file-mini-img"
                        />
                      </a>
                      
                      )}
                    </div>                  
                  );
                })}
              </div>  
            )}
             <p><strong>Created At:</strong> {new Date(issue.createdAt).toLocaleString()}</p>

<p><strong>Created By:</strong> {
  issue.createdByType === 'user'
    ? `${issue.creatorUser?.firstName || ''} ${issue.creatorUser?.lastName || ''}`
    : issue.creatorCustomer?.full_name || 'N/A'
}</p>
          </div>
        );
      })}
    </div>
    )}
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