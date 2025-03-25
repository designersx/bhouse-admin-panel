import React, { useState, useEffect } from 'react'; 
import Layout from '../../components/Layout';
import '../../styles/Projects/AddProject.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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
    assignedTeamRoles: ['Account Manager'],
    allowClientView: true,
    allowComments: true,
    enableNotifications: true,
  });
  
const [selectedRoles, setSelectedRoles] = useState(['Account Manager']); 
const [roleUsers, setRoleUsers] = useState({}); 
const [allRoles, setAllRoles] = useState([]);
const [files, setFiles] = useState([]); 

  const handleRoleToggle = async (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
      setRoleUsers((prev) => {
        const newUsers = { ...prev };
        delete newUsers[role];
        return newUsers;
      });
    } else {
      setSelectedRoles((prev) => [...prev, role]);
  
      // Fetch users for that role
      try {
        const encodedRole = encodeURIComponent(role);
        const res = await fetch(`http://localhost:5000/api/auth/users-by-role/${encodedRole}`);
        const data = await res.json();
        setRoleUsers((prev) => ({
          ...prev,
          [role]: data.users || []
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
        const roleTitles = data.data.map(role => role.title);
        setAllRoles(roleTitles);
        setFormData(prev => ({
          ...prev,
          assignedTeamRoles: ['Account Manager']
        }));
      }
    };
    fetchRoles();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };


  

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };
  

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
  
    const transformedRolesMap = new Map();

// Remove any invalid roles or duplicates
Object.entries(formData.assignedTeamRoles).forEach(([role, users]) => {
  if (!transformedRolesMap.has(role)) {
    transformedRolesMap.set(role, users);
  }
});

// Convert Map back to array of objects
const transformedRoles = Array.from(transformedRolesMap.entries()).map(
  ([role, users]) => ({
    role,
    users: Array.isArray(users) ? users : []
  })
);
  
    // Append all other fields (except assignedTeamRoles)
    Object.keys(formData).forEach((key) => {
      if (key !== 'assignedTeamRoles') {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });
  
    // Append the transformed assignedTeamRoles
    formDataToSend.append('assignedTeamRoles', JSON.stringify(transformedRoles));

  
    // Append selected files
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
                <h3>Add Project</h3>
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
                  <label>Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    placeholder="Enter client name"
                    maxLength={20}
                  />
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
                  <button type="button" onClick={nextStep}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-card">
                <h3>Roles & Permissions</h3>
                <div className='form-group-row'>
                <div className="form-group">
  <label>Assign Roles</label>
  {allRoles.map((role) => (
  <div key={role} className="role-section">
    <label>
      <input
        type="checkbox"
        value={role}
        checked={selectedRoles.includes(role)}
        onChange={() => handleRoleToggle(role)}
      />
      {role}
    </label>
    {selectedRoles.includes(role) && roleUsers[role] && (
      <select
        multiple
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
          setFormData((prev) => ({
            ...prev,
            assignedTeamRoles: {
              ...prev.assignedTeamRoles,
              [role]: selectedOptions
            }
          }));
        }}
      >
        {roleUsers[role].map((user) => (
          <option key={user.id} value={user.id}>
            {user.firstName} {user.lastName} ({user.email})
          </option>
        ))}
      </select>
    )}
  </div>
))}

</div>

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
                <div className="form-navigation">
                  <button type="button" onClick={prevStep}>
                    Previous
                  </button>
                  <button type="button" onClick={nextStep}>
                    Next
                  </button>
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
                  <button type="button" onClick={prevStep}>
                    Previous
                  </button>
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
