import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/Projects/AddProject.css';

const EditProject = () => {
  const { projectId } = useParams(); // Get project ID from the URL
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
    assignedTeamRoles: ['Account Manager'], // Ensure it's always an array
    allowClientView: true,
    allowComments: true,
    enableNotifications: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
        let fetchedProject = response.data;

        // Ensure that assignedTeamRoles is always an array
        if (typeof fetchedProject.assignedTeamRoles === 'string') {
          fetchedProject.assignedTeamRoles = JSON.parse(fetchedProject.assignedTeamRoles || '[]'); // Parse if it's a JSON string
        }

        setFormData({
          ...fetchedProject,
          assignedTeamRoles: Array.isArray(fetchedProject.assignedTeamRoles)
            ? fetchedProject.assignedTeamRoles
            : ['Account Manager'], // Fallback to default array if not an array
        });
      } catch (error) {
        console.error('Error fetching project details', error);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

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
    // Only add the value if it's not already present
    if (!formData.assignedTeamRoles.includes(value)) {
      setFormData({
        ...formData,
        assignedTeamRoles: [...formData.assignedTeamRoles, value],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.status === 200) {
        alert('Project updated successfully!');
        navigate(`/project-details/${projectId}`); 
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred while updating the project.');
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

export default EditProject;
