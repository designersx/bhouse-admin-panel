import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoleById, updateRole } from "../lib/api";
import Layout from "../components/Layout";

const modules = [
  "User Management",
  "Project Management",
  "Notification Management",
  "Invoicing and Payment",
  "Installation & Delivery Scheduling",
  "Document Management",
  "Reports & Analytics",
  "Reviews/Feedback & Comments",
  "Customer Dashboard",
];

const actions = ["Create", "Delete", "View", "Edit", "FullAccess"];

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchRoleData();
  }, []);

  const fetchRoleData = async () => {
    const response = await getRoleById(id);
    if (response.success) {
      const parsedPermissions = JSON.parse(response.data.permissions || "{}");
      setTitle(response.data.title);
      setDesc(response.data.description || "");
      setPermissions(parsedPermissions);
    }
  };

  const handleCheckboxChange = (module, action) => {
    setPermissions((prev) => {
      let newPermissions = {
        ...prev,
        [module]: {
          ...prev[module],
          [action]: !prev[module]?.[action] || false,
        },
      };

      // Auto-check View when Edit is selected
      if (action === "Edit" && newPermissions[module][action]) {
        newPermissions[module]["View"] = true;
      }

      // Check all when FullAccess is selected
      if (action === "FullAccess") {
        const isFullAccess = newPermissions[module][action];
        actions.forEach((act) => {
          newPermissions[module][act] = isFullAccess;
        });
      }

      return newPermissions;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const roleData = { title, desc, permissions, updatedBy: 1 };
    try {
      await updateRole(id, roleData);
      alert("Role Updated Successfully!");
      navigate("/roles");
    } catch (error) {
      alert("Error Updating Role!");
    }
  };

  return (
    <Layout>
      <div className="create-role-container">
        <h2>Edit Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Role Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Description:</label>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>

          <table className="permissions-table">
            <thead>
              <tr>
                <th>Module</th>
                {actions.map((action) => (
                  <th key={action}>{action}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr key={module}>
                  <td>{module}</td>
                  {actions.map((action) => (
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
            <button className="submit-btn" type="submit">Update Role</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditRole;
