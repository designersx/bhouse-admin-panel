import React, { useState } from 'react';
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

  const [files, setFiles] = useState([]); // Store the files selected by the user

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

  const handleRolesChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      assignedTeamRoles: [...formData.assignedTeamRoles, value],
    });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files); // Store selected files
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    // Append form data to FormData object
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    // Append selected files to FormData
    for (let file of files) {
      formDataToSend.append('files', file);
    }

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        body: formDataToSend, // Send FormData to backend
      });
      const data = await response.json();
      if (response.status === 201) {
        Swal.fire('Project added successfully!');
        navigate('/projects');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Error: ${data.error}`,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
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
                <div className="form-group">
                  <label>Upload Files (Images/PDFs)</label>
                  <input
                    type="file"
                    name="files"
                    multiple
                    onChange={handleFileChange} // Handle file input change
                  />
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
                <div className="form-group">
                  <label>Assigned Roles</label>
                  <input
                    type="text"
                    name="assignedTeamRoles"
                    value={formData.assignedTeamRoles.join(', ')}
                    onChange={handleRolesChange}
                    placeholder="Add roles"
                  />
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
