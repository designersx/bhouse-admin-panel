import React, { useState, useEffect } from 'react'; 
import Layout from '../../components/Layout';
import '../../styles/Projects/AddProject.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../lib/api';

const AddProject = () => {
  const [step, setStep] = useState(1);
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
  });

  const [selectedRoles, setSelectedRoles] = useState([]); 
  const [roleUsers, setRoleUsers] = useState({}); 
  const [allRoles, setAllRoles] = useState([]);
  const [files, setFiles] = useState([]); 
  const [customers, setCustomers] = useState([]);
  const [leadTimeMatrix, setLeadTimeMatrix] = useState([
    { itemName: '', quantity: '', expectedDate: '', status: 'Pending' }
  ]);
  const navigate = useNavigate();

  const handleItemChange = (index, field, value) => {
    const updated = [...leadTimeMatrix];
    updated[index][field] = value;
    setLeadTimeMatrix(updated);
  };
  
  const handleAddItemRow = () => {
    setLeadTimeMatrix([
      ...leadTimeMatrix,
      { itemName: '', quantity: '', expectedDate: '', status: 'Pending' }
    ]);
  };
  
  const handleRemoveItemRow = (index) => {
    const updated = [...leadTimeMatrix];
    updated.splice(index, 1);
    setLeadTimeMatrix(updated);
  };
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleRoleToggle = async (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
      setRoleUsers(prev => {
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
  
      try {
        const encodedRole = encodeURIComponent(role);
        const res = await fetch(`http://localhost:5000/api/auth/users-by-role/${encodedRole}`);
        const data = await res.json();
        const users = data.users || [];
  
        setRoleUsers(prev => ({ ...prev, [role]: users }));
  
        // Optional: auto-select user with permissionLevel === 2
        const defaultUsers = users.filter(user => user.permissionLevel === 2);
        const defaultUserIds = defaultUsers.map(user => user.id);
        setFormData(prev => ({
          ...prev,
          assignedTeamRoles: {
            ...prev.assignedTeamRoles,
            [role]: defaultUserIds
          }
        }));
      } catch (err) {
        console.error(`Error fetching users for role ${role}`, err);
      }
    }
  };
  

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch('http://localhost:5000/api/roles');
      const data = await res.json();
      if (data.success) {
        const allowedLevels = [2, 3, 4, 5];
        const filtered = data.data.filter(role => allowedLevels.includes(role.defaultPermissionLevel));
        const roleTitles = filtered.map(role => role.title);
        setAllRoles(roleTitles);
      }
    };
    fetchRoles();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Convert assignedTeamRoles object to array of { role, users }
    const transformedRoles = Object.entries(formData.assignedTeamRoles).map(
      ([role, users]) => ({
        role,
        users: Array.isArray(users) ? users : []
      })
    );

    Object.keys(formData).forEach((key) => {
      if (key !== 'assignedTeamRoles') {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    formDataToSend.append('assignedTeamRoles', JSON.stringify(transformedRoles));
    formDataToSend.append('leadTimeMatrix', JSON.stringify(leadTimeMatrix));

    for (let file of files) {
      formDataToSend.append('files', file);
    }

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.status === 201) {
        Swal.fire('Project added successfully!');
        navigate('/projects');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Error: ${data.error}`
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!'
      });
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Layout>
      <div className="add-project-container">
        <h2>Add New Project</h2>
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
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter project name"
                      maxLength={20}
                    />
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
                    <select
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                    >
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
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter project description"
                      maxLength={60}
                    ></textarea>
                  </div>
                </div>
                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Estimated Completion</label>
                    <input
                      type="date"
                      name="estimatedCompletion"
                      value={formData.estimatedCompletion}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Upload Files (Images/PDFs)</label>
                    <input
                      type="file"
                      name="files"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                    {files.length > 0 && (
                      <ul className="file-preview-list">
                        {files.map((file, idx) => (
                          <li key={idx}>{file.name}</li>
                        ))}
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
                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Assign Roles</label>
                    <div className="roles-container-ui">
  {allRoles.map((role) => (
    <div key={role} className={`role-card ${selectedRoles.includes(role) ? 'active' : ''}`}>
      <div className="role-header">
        <label>
          <input
            type="checkbox"
            checked={selectedRoles.includes(role)}
            onChange={() => handleRoleToggle(role)}
          />
          <span className="role-title">{role}</span>
        </label>
      </div>

      {selectedRoles.includes(role) && roleUsers[role] && (
        <div className="role-users">
          {roleUsers[role].map((user) => {
            const isChecked = (formData.assignedTeamRoles[role] || []).includes(user.id);
            return (
              <label key={user.id} className="user-checkbox-pill">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const prevSelected = formData.assignedTeamRoles[role] || [];
                    const updatedUsers = e.target.checked
                      ? [...prevSelected, user.id]
                      : prevSelected.filter((id) => id !== user.id);

                    setFormData((prev) => ({
                      ...prev,
                      assignedTeamRoles: {
                        ...prev.assignedTeamRoles,
                        [role]: updatedUsers,
                      },
                    }));
                  }}
                />
                {user.firstName} {user.email}
              </label>
            );
          })}
        </div>
      )}
    </div>
  ))}
</div>

                  </div>
                
                </div>
              
                <div className='form-group-row'>
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Enter delivery address"
                      maxLength={50}
                    />
                  </div>
                  <div className="form-group">
                    <label>Delivery Hours</label>
                    <input
                      type="text"
                      name="deliveryHours"
                      value={formData.deliveryHours}
                      onChange={handleChange}
                      placeholder="Enter delivery hours"
                    />
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
                  <h3>Project Lead Time Matrix</h3>
<div className="lead-time-matrix-container">
  {leadTimeMatrix.map((item, index) => (
    <div key={index} className="item-row">
      <input
        type="text"
        placeholder="Item Name"
        value={item.itemName}
        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
      />
      <input
        type="number"
        placeholder="Quantity"
        value={item.quantity}
        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
      />
      <input
        type="date"
        value={item.expectedDate}
        onChange={(e) => handleItemChange(index, 'expectedDate', e.target.value)}
      />
      <select
        value={item.status}
        onChange={(e) => handleItemChange(index, 'status', e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Delivered">Delivered</option>
      </select>
      {leadTimeMatrix.length > 1 && (
        <button type="button" onClick={() => handleRemoveItemRow(index)}>Remove</button>
      )}
    </div>
  ))}
  <button className='ledbutton' type="button" onClick={handleAddItemRow}>+ Add Item</button>
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
                  <input
                    type="checkbox"
                    name="allowClientView"
                    checked={formData.allowClientView}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="form-group">
                  <label>Allow Comments</label>
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="form-group">
                  <label>Enable Notifications</label>
                  <input
                    type="checkbox"
                    name="enableNotifications"
                    checked={formData.enableNotifications}
                    onChange={handleCheckboxChange}
                  />
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

export default AddProject;
