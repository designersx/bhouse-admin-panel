import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/Projects/AddProject.css';
import { url } from '../../lib/api';
const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [allRoles, setAllRoles] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [selectedRoles, setSelectedRoles] = useState({ "Account Manager": [] });
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
    allowClientView: true,
    allowComments: true,
    enableNotifications: true,
    fileUrls: [],
  });

  const [files, setFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchProjectDetails();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get(`${url}/roles`);
    const roleTitles = res.data?.data.map(role => role.title) || [];
    setAllRoles(roleTitles);
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`${url}/projects/${projectId}`);
      const project = response.data;

      const parsedRoles = typeof project.assignedTeamRoles === 'string'
        ? JSON.parse(project.assignedTeamRoles)
        : project.assignedTeamRoles;

      const roleMap = {};
      parsedRoles.forEach(({ role, users }) => {
        roleMap[role] = users;
        fetchUsers(role); // fetch users for dropdown
      });

      setSelectedRoles(roleMap);
      setFormData({
        ...project,
        fileUrls: Array.isArray(project.fileUrls) ? project.fileUrls : JSON.parse(project.fileUrls || '[]')
      });
    } catch (err) {
      console.error('Error fetching project details:', err);
    }
  };

  const fetchUsers = async (role) => {
    try {
      const res = await axios.get(`${url}/users-by-role/${encodeURIComponent(role)}`);
      setUsersByRole(prev => ({ ...prev, [role]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch users for role: ${role}`);
    }
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev => {
      const updated = { ...prev };
      if (updated[role]) {
        delete updated[role];
      } else {
        updated[role] = [];
        fetchUsers(role);
      }
      return updated;
    });
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      if (key !== 'assignedTeamRoles') {
        if (Array.isArray(val)) {
          formDataToSend.append(key, JSON.stringify(val));
        } else {
          formDataToSend.append(key, val);
        }
      }
    });

    // Filter duplicate roles (especially "Account Manager")
    const uniqueRoles = [];
    const seen = new Set();
    for (const [role, users] of Object.entries(selectedRoles)) {
      if (!seen.has(role)) {
        seen.add(role);
        uniqueRoles.push({ role, users });
      }
    }

    formDataToSend.append("assignedTeamRoles", JSON.stringify(uniqueRoles));
    formDataToSend.append("removedFiles", JSON.stringify(removedFiles));
    files.forEach(file => formDataToSend.append("files", file));

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        body: formDataToSend
      });
      const data = await res.json();

      if (res.status === 200) {
        alert("Project updated successfully!");
        navigate(`/project-details/${projectId}`);
      } else {
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
{formData.fileUrls && formData.fileUrls.length > 0 && (
  <div className="existing-files">
    <h4>Previously Uploaded Files:</h4>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {formData.fileUrls.map((url, idx) => {
        const fileName = url.split('/').pop();
        const fileExt = fileName.split('.').pop().toLowerCase();
        const fileUrl = url.startsWith('uploads') ? `http://localhost:5000/${url}` : url;

        return (
          <li key={idx} style={{ marginBottom: '10px' }}>
            {['jpg', 'jpeg', 'png'].includes(fileExt) ? (
              <img
                src={fileUrl}
                alt={fileName}
                style={{ width: '100px', height: 'auto', marginRight: '10px' }}
              />
            ) : (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                {fileName}
              </a>
            )}
            <button
              type="button"
              onClick={() => handleRemoveExistingFile(url)}
              style={{
                marginLeft: '10px',
                padding: '2px 6px',
                backgroundColor: '#ff4d4d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  </div>
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
                {allRoles.map(role => (
                  <div key={role} className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedRoles.hasOwnProperty(role)}
                        onChange={() => toggleRole(role)}
                      />
                      {role}
                    </label>

                    {selectedRoles[role] && (
                      <select multiple value={selectedRoles[role]} onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                        setSelectedRoles(prev => ({
                          ...prev,
                          [role]: selected
                        }));
                      }}>
                        {(usersByRole[role] || []).map(user => (
                          <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
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

export default EditProject;
