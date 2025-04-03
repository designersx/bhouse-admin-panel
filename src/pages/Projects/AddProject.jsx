import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import '../../styles/Projects/AddProject.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../../lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { url } from '../../lib/api';
import BackButton from '../../components/BackButton';
const AddProject = () => {
  const [step, setStep] = useState(1);
  let [clientId , setClientId] = useState()
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
   clientId : clientId
  });

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleUsers, setRoleUsers] = useState({});
  const [allRoles, setAllRoles] = useState([]);
  const [files, setFiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leadTimeMatrix, setLeadTimeMatrix] = useState([
    { itemName: '', quantity: '', expectedDeliveryDate: '', status: 'Pending' }
  ]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateStep1 = () => {
    const { name, type, clientName, startDate, estimatedCompletion } = formData;
  
    if (!name.trim()) return "Project Name is required.";
    if (!/^[A-Za-z\s]+$/.test(name.trim())) return "Project Name must contain only letters and spaces.";
    if (!type) return "Project Type is required.";
    if (!clientName) return "Customer selection is required.";
    if (!startDate) return "Start Date is required.";
  
    if (estimatedCompletion) {
      const start = new Date(startDate);
      const end = new Date(estimatedCompletion);
      if (end <= start) {
        return "Estimated Completion date must be after Start Date.";
      }
    }
  
    return null;
  };
  
  const validateStep2 = () => {
    const { totalValue, deliveryAddress, deliveryHours } = formData;
    if (!totalValue || totalValue <= 0) return "Total Value must be a positive number.";
    if (!deliveryAddress.trim()) return "Delivery Address is required.";
    if (!deliveryHours.trim()) return "Delivery Hours is required.";
    if (selectedRoles.length === 0) return "At least one role must be selected.";
    
    if (leadTimeMatrix.length === 0) return "At least one item in the Lead Time Matrix is required.";
    for (const item of leadTimeMatrix) {
      if (!item.itemName.trim() || !item.quantity || !item.expectedDeliveryDate) {
        return "All Lead Time Matrix items must be fully filled.";
      }
    }
  
    return null;
  };
  
  const nextStep = () => {
    let errorMsg = null;
  
    if (step === 1) errorMsg = validateStep1();
    else if (step === 2) errorMsg = validateStep2();
  
    if (errorMsg) {
     toast.error(`Error: ${errorMsg}`)
      return;
    }
  
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleItemChange = (index, field, value) => {
    const updated = [...leadTimeMatrix];
    updated[index][field] = value;
    setLeadTimeMatrix(updated);
  };

  const handleAddItemRow = () => {
    setLeadTimeMatrix([
      ...leadTimeMatrix,
      { itemName: '', quantity: '', expectedDeliveryDate: '', status: 'Pending' }
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
        const res = await fetch(`${url}/auth/users-by-role/${encodedRole}`);
        const data = await res.json();
        const users = data.users || [];

        setRoleUsers(prev => ({ ...prev, [role]: users }));
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
      const res = await fetch(`${url}/roles`);
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



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const step3validation = () => {
      return null; // No required fields in Step 3
    };
  
    const errorMsg = step3validation();
    if (errorMsg) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: errorMsg,
      });
      return;
    }
  
    const formDataToSend = new FormData();
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
    for (let file of formData.proposals || []) {
      formDataToSend.append('proposals', file);
    }
    for (let file of formData.floorPlans || []) {
      formDataToSend.append('floorPlans', file);
    }
    for (let file of formData.otherDocuments || []) {
      formDataToSend.append('otherDocuments', file);
    }
  
    try {
      setLoading(true);
      const response = await fetch(`${url}/projects`, {
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
    } finally {
      setLoading(false);
    }
  };
  

 
  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="add-project-container">
        <BackButton/>
        {loading && (
          <div className="loader-overlay">
            <div className="loader"></div>
          </div>
        )}
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
                      maxLength={40}
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
  onChange={(e) => {
    const selectedCustomer = customers.find(
      (customer) => customer.full_name === e.target.value
    );
    
    setFormData({
      ...formData,
      clientName: e.target.value, 
      clientId: selectedCustomer?.id || "", 
    });
    setClientId(selectedCustomer?.id)
   
  }}
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
    value={formData.startDate ? formData.startDate.split('T')[0] : ''}
    onChange={handleChange}
    required
  />
</div>

<div className="form-group">
  <label>Estimated Completion</label>
  <input
    type="date"
    name="estimatedCompletion"
    value={formData.estimatedCompletion ? formData.estimatedCompletion.split('T')[0] : ''}
    min={formData.startDate || ""}
    onChange={handleChange}
  />
</div>
</div>


                <div className='form-group-row'>
  <div className="form-group">
    <label>Upload Proposals & Presentations (PDF, Images)</label>
    <input
      type="file"
      name="proposals"
      multiple
      accept=".jpg,.jpeg,.png,.pdf"
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          proposals: [...(prev.proposals || []), ...Array.from(e.target.files)],
        }))
      }
    />
    {formData.proposals?.length > 0 && (
      <ul className="file-preview-list">
        {formData.proposals.map((file, idx) => (
          <li key={idx}>{file.name}</li>
        ))}
      </ul>
    )}
  </div>

  <div className="form-group">
    <label>Upload Floor Plans, CAD Files</label>
    <input
      type="file"
      name="floorPlans"
      multiple
      accept=".jpg,.jpeg,.png,.pdf"
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          floorPlans: [...(prev.floorPlans || []), ...Array.from(e.target.files)],
        }))
      }
    />
    {formData.floorPlans?.length > 0 && (
      <ul className="file-preview-list">
        {formData.floorPlans.map((file, idx) => (
          <li key={idx}>{file.name}</li>
        ))}
      </ul>
    )}
  </div>

  <div className="form-group">
    <label>Upload Other Documents (COI, Permits, etc.)</label>
    <input
      type="file"
      name="otherDocuments"
      multiple
      accept=".jpg,.jpeg,.png,.pdf"
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          otherDocuments: [...(prev.otherDocuments || []), ...Array.from(e.target.files)],
        }))
      }
    />
    {formData.otherDocuments?.length > 0 && (
      <ul className="file-preview-list">
        {formData.otherDocuments.map((file, idx) => (
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
      className='user-search-input'
        type="text"
        placeholder="Item Name"
        value={item.itemName}
        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
      />
      <input
       className='user-search-input'
        type="number"
        placeholder="Quantity"
        value={item.quantity}
        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
      />
      <input
       className='user-search-input'
        type="date"
        value={item.expectedDeliveryDate}
        onChange={(e) => handleItemChange(index, 'expectedDeliveryDate', e.target.value)}
      />
      <select
       className='user-search-input'
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

                <br />


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
