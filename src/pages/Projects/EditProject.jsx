import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/Projects/AddProject.css';
import { url, getCustomers } from '../../lib/api';

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [allRoles, setAllRoles] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Residential',
    clientName: '',
    description: '',
    startDate: '',
    estimatedCompletion: '',
    totalValue: '',
    deliveryAddress: '',
    deliveryHours: '',
    assignedTeamRoles: {},
    allowClientView: true,
    allowComments: true,
    enableNotifications: true,
    fileUrls: [],
  });
  const [leadTimeMatrix, setLeadTimeMatrix] = useState([]);
  const [files, setFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchProjectDetails();
    fetchCustomers();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get(`${url}/roles`);
    const allowedLevels = [2, 3, 4, 5];
    const filtered = res.data?.data.filter(role => allowedLevels.includes(role.defaultPermissionLevel));
    const roleTitles = filtered.map(role => role.title);
    setAllRoles(roleTitles);
  };

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`${url}/projects/${projectId}`);
      const project = res.data;

      const parsedRoles = typeof project.assignedTeamRoles === 'string'
        ? JSON.parse(project.assignedTeamRoles)
        : project.assignedTeamRoles;

      const roleMap = {};
      const selected = [];

      for (const { role, users } of parsedRoles) {
        roleMap[role] = users;
        selected.push(role);
        fetchUsers(role);
      }
      setSelectedRoles(selected);
      setFormData({
        ...project,
        assignedTeamRoles: roleMap,
        fileUrls: Array.isArray(project.fileUrls) ? project.fileUrls : JSON.parse(project.fileUrls || '[]'),
      });
      setLeadTimeMatrix(
        typeof project.leadTimeMatrix === 'string'
          ? JSON.parse(project.leadTimeMatrix || '[]')
          : project.leadTimeMatrix || []
      );
      
      
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const fetchUsers = async (role) => {
    try {
      const res = await axios.get(`${url}/auth/users-by-role/${encodeURIComponent(role)}`);
      const users = res.data?.users || [];
      setUsersByRole(prev => ({ ...prev, [role]: users }));
    } catch (err) {
      console.error(`Failed to fetch users for role: ${role}`, err);
    }
  };
  
  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const toggleRole = async (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
      setUsersByRole(prev => {
        const updated = { ...prev };
        delete updated[role];
        return updated;
      });
      setFormData(prev => {
        const updated = { ...prev.assignedTeamRoles };
        delete updated[role];
        return { ...prev, assignedTeamRoles: updated };
      });
    } else {
      setSelectedRoles(prev => [...prev, role]);
      fetchUsers(role);
      setFormData(prev => ({
        ...prev,
        assignedTeamRoles: {
          ...prev.assignedTeamRoles,
          [role]: [],
        }
      }));
    }
  };

  const handleUserCheckbox = (role, userId, checked) => {
    const prevSelected = formData.assignedTeamRoles[role] || [];
    const updatedUsers = checked
      ? [...prevSelected, userId]
      : prevSelected.filter(id => id !== userId);

    setFormData(prev => ({
      ...prev,
      assignedTeamRoles: {
        ...prev.assignedTeamRoles,
        [role]: updatedUsers,
      }
    }));
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleRemoveExistingFile = (url) => {
    setRemovedFiles(prev => [...prev, url]);
    setFormData(prev => ({
      ...prev,
      fileUrls: prev.fileUrls.filter(f => f !== url),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    const transformedRoles = Object.entries(formData.assignedTeamRoles).map(([role, users]) => ({
      role,
      users
    }));

    Object.entries(formData).forEach(([key, val]) => {
      if (key !== 'assignedTeamRoles') {
        formDataToSend.append(key, Array.isArray(val) ? JSON.stringify(val) : val);
      }
    });
    formDataToSend.append("leadTimeMatrix", JSON.stringify(leadTimeMatrix));
    formDataToSend.append("assignedTeamRoles", JSON.stringify(transformedRoles));
    formDataToSend.append("removedFiles", JSON.stringify(removedFiles));
    files.forEach(file => formDataToSend.append("files", file));

    try {
      const res = await fetch(`${url}/projects/${projectId}`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (res.status === 200) {
        alert("Project updated successfully!");
        navigate(`/project-details/${projectId}`);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to update project");
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Layout>
      <div className="add-project-container">
        <h2>Edit Project</h2>
        <div className="step-indicator">
          <span className={step === 1 ? 'active' : ''}>Step 1</span>
          <span className={step === 2 ? 'active' : ''}>Step 2</span>
          <span className={step === 3 ? 'active' : ''}>Step 3</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={`form-step step-${step}`}>
            {step === 1 && (
              <div className="form-card">
                <h3>Project Details</h3>
                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Project Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Select Customer</label>
                    <select name="clientName" value={formData.clientName} onChange={handleChange} required>
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.full_name}>
                          {customer.full_name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} />
                  </div>
                </div>

                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Estimated Completion</label>
                    <input type="date" name="estimatedCompletion" value={formData.estimatedCompletion} onChange={handleChange} />
                  </div>
                </div>

                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Upload Files (Images/PDFs)</label>
                    <input type="file" name="files" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                    {formData.fileUrls.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.fileUrls.map((url, idx) => {
                          const fileName = url.split('/').pop();
                          const fileExt = fileName.split('.').pop();
                          const fileUrl = url.startsWith('uploads') ? `${url}` : url;

                          return (
                            <li key={idx}>
                              {['jpg', 'jpeg', 'png'].includes(fileExt) ? (
                                <img src={`http://localhost:5000/${fileUrl}`} alt={fileName} width="100" />
                              ) : (
                                <a href={`http://localhost:5000/${fileUrl}`} target="_blank" rel="noreferrer">{fileName}</a>
                              )}
                              <button type="button" onClick={() => handleRemoveExistingFile(url)}>Remove</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={nextStep}>Next</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-card">
                <h3>Roles & Permissions</h3>
                <div className="roles-container-ui">
                  {allRoles.map((role) => (
                    <div key={role} className={`role-card ${selectedRoles.includes(role) ? 'active' : ''}`}>
                      <div className="role-header">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                          />
                          <span className="role-title">{role}</span>
                        </label>
                      </div>

                      {selectedRoles.includes(role) && usersByRole[role] && (
                        <div className="role-users">
                          {usersByRole[role].map((user) => (
                            <label key={user.id} className="user-checkbox-pill">
                              <input
                                type="checkbox"
                                checked={(formData.assignedTeamRoles[role] || []).includes(user.id)}
                                onChange={(e) => handleUserCheckbox(role, user.id, e.target.checked)}
                              />
                              {user.firstName} {user.lastName}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

        

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input type="text" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Delivery Hours</label>
                    <input type="text" name="deliveryHours" value={formData.deliveryHours} onChange={handleChange} />
                  </div>
                </div>
                <div className='form-group-row'>
                <div className="form-group">
                    <label>Total Value</label>
                    <input
                      type="number"
                      name="totalValue"
                      value={formData.totalValue}
                      onChange={handleChange}
                      required
                      placeholder="Enter total value"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Proposal">Proposal</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Delivered to Warehouse">Delivered to Warehouse</option>
                      <option value="nstalled">Installed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  </div>
                  <div className="form-card">
  <h3>Project Lead Time Matrix</h3>
  {leadTimeMatrix.map((item, index) => (
  <div className="form-group-row" key={index}>
    <div className="form-group">
      <label>Item Name</label>
      <input
        type="text"
        value={item.itemName}
        onChange={(e) => {
          const updated = [...leadTimeMatrix];
          updated[index].itemName = e.target.value;
          setLeadTimeMatrix(updated);
        }}
      />
    </div>
    <div className="form-group">
      <label>Quantity</label>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => {
          const updated = [...leadTimeMatrix];
          updated[index].quantity = e.target.value;
          setLeadTimeMatrix(updated);
        }}
      />
    </div>
    <div className="form-group">
      <label>Expected Delivery Date</label>
      <input
        type="date"
        value={item.expectedDelivery}
        onChange={(e) => {
          const updated = [...leadTimeMatrix];
          updated[index].expectedDelivery = e.target.value;
          setLeadTimeMatrix(updated);
        }}
      />
    </div>
    <div className="form-group">
      <label>Status</label>
      <select
        value={item.status}
        onChange={(e) => {
          const updated = [...leadTimeMatrix];
          updated[index].status = e.target.value;
          setLeadTimeMatrix(updated);
        }}
      >
        <option value="Pending">Pending</option>
        <option value="Delivered">Delivered</option>
      </select>
    </div>
  </div>
))}

  <div className="form-group">
    <button
      type="button"
      className="add-matrix-row-btn"
      onClick={() =>
        setLeadTimeMatrix([...leadTimeMatrix, {
          itemName: '',
          quantity: '',
          expectedDelivery: '',
          status: 'Pending'
        }])
      }
    >
      + Add Item
    </button>
  </div>
</div>
<br/>

                <div className="form-navigation">
                  <button type="button" onClick={prevStep}>Previous</button>
                  <button type="button" onClick={nextStep}>Next</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-card">
                <h3>Additional Settings</h3>
                <div className="form-group">
                  <label>Allow Client View</label>
                  <input type="checkbox" name="allowClientView" checked={formData.allowClientView} onChange={handleCheckboxChange} />
                </div>
                <div className="form-group">
                  <label>Allow Comments</label>
                  <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleCheckboxChange} />
                </div>
                <div className="form-group">
                  <label>Enable Notifications</label>
                  <input type="checkbox" name="enableNotifications" checked={formData.enableNotifications} onChange={handleCheckboxChange} />
                </div>
                <div className="form-navigation">
                  <button type="button" onClick={prevStep}>Previous</button>
                  <button type="submit">Submit</button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProject;
