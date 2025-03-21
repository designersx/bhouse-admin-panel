import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoleById, updateRole } from "../lib/api"; // API functions import karo
import Layout from "../components/Layout";

const modules = [
  "Regular Entries",
  "Type of Entries",
  "Roles",
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
  const [roleData, setRoleData] = useState({
    title: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    fetchRoleData();
  }, []);

  const fetchRoleData = async () => {
    const response = await getRoleById(id);
    if (response.success) {
      // Convert permission object to array format
      const parsedPermissions = JSON.parse(response.data.permissions || "{}");

      const updatedPermissions = modules.map((module) => ({
        moduleName: module,
        actions: actions.filter((action) => parsedPermissions[module]?.[action] || false),
      }));

      setRoleData({
        title: response.data.title,
        description: response.data.description,
        permissions: updatedPermissions,
      });
    }
  };

  const handleCheckboxChange = (moduleName, action) => {
    setRoleData((prev) => {
      const updatedPermissions = prev.permissions.map((module) =>
        module.moduleName === moduleName
          ? {
              ...module,
              actions: module.actions.includes(action)
                ? module.actions.filter((act) => act !== action)
                : [...module.actions, action],
            }
          : module
      );

      return { ...prev, permissions: updatedPermissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPermissions = roleData.permissions.reduce((acc, module) => {
      acc[module.moduleName] = actions.reduce((obj, action) => {
        obj[action] = module.actions.includes(action);
        return obj;
      }, {});
      return acc;
    }, {});

    await updateRole(id, { ...roleData, permissions: JSON.stringify(formattedPermissions) });
    navigate("/roles");
  };

  return (
    <Layout>
      <div className="create-role-container">
        <h2>Edit Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Role Title:</label>
            <input
              type="text"
              value={roleData.title}
              onChange={(e) => setRoleData({ ...roleData, title: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>Description:</label>
            <input
              type="text"
              value={roleData.description || ""}
              onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
            />
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
              {roleData.permissions.map((moduleData, index) => (
                <tr key={index}>
                  <td>{moduleData.moduleName}</td>
                  {actions.map((action) => (
                    <td key={action}>
                      <input
                        type="checkbox"
                        checked={moduleData.actions.includes(action)}
                        onChange={() => handleCheckboxChange(moduleData.moduleName, action)}
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
