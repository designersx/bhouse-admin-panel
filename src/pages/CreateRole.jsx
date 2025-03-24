import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { createRole } from "../lib/api";
import "../styles/createRoles.css";
import useRolePermissions from "../hooks/useRolePermissions";

const CreateRole = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();
  const { rolePermissions, loading, error } = useRolePermissions(17);

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

  const actions = ["create", "delete", "view", "edit", "fullAccess"]; // ✅ First letter small

  // ✅ API se jo data aaya, usko default permissions me set karna
  useEffect(() => {
    if (rolePermissions) {
      const formattedPermissions = {};
      modules.forEach((module) => {
        const formattedModule = module.replace(/\s+/g, ""); // ✅ Remove spaces from keys
        formattedPermissions[formattedModule] = {};

        actions.forEach((action) => {
          formattedPermissions[formattedModule][action] =
            rolePermissions[module]?.[action.charAt(0).toUpperCase() + action.slice(1)] || false;
        });
      });

      setPermissions(formattedPermissions);
    }
  }, [rolePermissions]);

  const handleCheckboxChange = (module, action) => {
    const formattedModule = module.replace(/\s+/g, ""); // ✅ Remove spaces for backend consistency

    setPermissions((prev) => {
      let newPermissions = {
        ...prev,
        [formattedModule]: {
          ...prev[formattedModule],
          [action]: !prev[formattedModule]?.[action],
        },
      };

      // ✅ Auto-check View when Edit is selected
      if (action === "edit" && newPermissions[formattedModule][action]) {
        newPermissions[formattedModule]["view"] = true;
      }

      // ✅ Check all when Full Access is selected
      if (action === "fullAccess") {
        const isFullAccess = newPermissions[formattedModule][action];
        actions.forEach((act) => {
          newPermissions[formattedModule][act] = isFullAccess;
        });
      }

      return newPermissions;
    });
  };

  const handleSubmit = async () => {
    // ✅ Backend me jo bhi select nahi hua usko explicitly `false` bhejna
    const finalPermissions = {};
    modules.forEach((module) => {
      const formattedModule = module.replace(/\s+/g, "");
      finalPermissions[formattedModule] = {};

      actions.forEach((action) => {
        finalPermissions[formattedModule][action] = permissions[formattedModule]?.[action] || false;
      });
    });

    const roleData = { title, desc, permissions: finalPermissions, createdBy: 1 };


    try {
      await createRole(roleData);
      alert("Role Created Successfully!");
      navigate("/roles");
    } catch (error) {
      alert("Error Creating Role!");
    }
  };

  return (
    <Layout>
      <div className="create-role-container">
        <h2>Create New Role</h2>

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
                <th key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => {
              const formattedModule = module.replace(/\s+/g, ""); // ✅ Remove spaces
              return (
                <tr key={module}>
                  <td>{module}</td>
                  {actions.map((action) => (
                    <td key={action}>
                      <input
                        type="checkbox"
                        checked={permissions[formattedModule]?.[action] || false}
                        onChange={() => handleCheckboxChange(module, action)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="button-group">
          <button className="submit-btn" onClick={handleSubmit}>
            Save Role
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRole;
