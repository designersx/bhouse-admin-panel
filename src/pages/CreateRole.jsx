import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { createRole } from '../lib/api';
import '../styles/createRoles.css';

const CreateRole = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();

  const modules = [
    'Project Management',
    'User Management',
    'Reports',
    'Settings',
    'Billing',
  ];

  const actions = ['Module', 'Create', 'Read', 'Update', 'Delete'];

  const handleCheckboxChange = (module, action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action] || false,
      },
    }));
  };

  const handleSubmit = async () => {
    const roleData = { title, desc, permissions, createdBy: 1 };

    try {
      await createRole(roleData);
      alert('Role Created Successfully!');
      navigate('/roles');
    } catch (error) {
      alert('Error Creating Role!');
    }
  };

  return (
    <Layout>
      <div className="create-role-container">
        <h2>Create New Role</h2>

        <div className="input-group">
          <label>Role Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Description:</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <table className="permissions-table">
          <thead>
            <tr>
              <th>Module</th>
              {actions.slice(1).map((action) => (
                <th key={action}>{action}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module}>
                <td>{module}</td>
                {actions.slice(1).map((action) => (
                  <td key={action}>
                    <input
                      type="checkbox"
                      checked={permissions[module]?.[action] || false}
                      onChange={() => handleCheckboxChange(module, action)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="button-group">
          <button className="submit-btn" onClick={handleSubmit}>
            Save Role
          </button>
          <button className="cancel-btn" onClick={() => navigate('/roles')}>
            Cancel
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRole;
