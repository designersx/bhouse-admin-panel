import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { createRole } from "../lib/api";
import "../styles/createRoles.css";
import useRolePermissions from "../hooks/useRolePermissions";
import { IoArrowBack } from "react-icons/io5";
import Swal from "sweetalert2";

const predefinedRoles = [
  "Super Admin",
  "Account Manager",
  "Sr. Designer",
  "Operations",
  "Junior Designer" , 
  "Lead Installer",
];

const rolePermissionLevels = {
  "Super Admin": 1,
  "Account Manager": 2,
  "Sr. Designer": 3,
  "Operations": 4,
  "Junior Designer": 5,
  "Lead Installer" : 6
};

const CreateRole = () => {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { rolePermissions } = useRolePermissions(24);
  const inputRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.userRole || "";
  const userPermissionLevel = rolePermissionLevels[userRole] || 5;

  const availableRoles = predefinedRoles.filter(
    (role) => rolePermissionLevels[role] > userPermissionLevel
  );

  const modules = [
    "User Management",
    "Project Management",
  
    "Invoicing",
   
    "Reviews/Feedback & Comments",
    "Customer",
    "Roles"
  ];
  
  const actions = ["create", "delete", "view", "edit", "fullAccess"];
  const otherModules = [
    "Customer Comments" , 
    "Customer Document" ,
    "Comments on Document" ,
    "Project Document" , 
    "Punch List"  , 
    "Assigned Team Comments"
  ]
  
  
  
    const other_Actions  = ["view" , "add"]


  useEffect(() => {
    if (rolePermissions) {
      const formattedPermissions = {};
      modules.forEach((module) => {
        const formattedModule = module.replace(/\s+/g, "");
        formattedPermissions[formattedModule] = {};

        actions.forEach((action) => {
          formattedPermissions[formattedModule][action] =
            rolePermissions[module]?.[action.charAt(0).toUpperCase() + action.slice(1)] || false;
        });
      });

      setPermissions(formattedPermissions);
    }
  }, [rolePermissions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const selectSuggestion = (role) => {
    setTitle(role);
    setDropdownOpen(false);
  };


  const handleCheckboxChange = (module, action) => {
    const formattedModule = module.replace(/\s+/g, "");
  
    setPermissions((prev) => {
      let newPermissions = {
        ...prev,
        [formattedModule]: {
          ...prev[formattedModule],
          [action]: !prev[formattedModule]?.[action],
        },
      };
  
      const updatedValue = !prev[formattedModule]?.[action];
  
      // If "create" is checked, auto-check delete & view
      if (action === "create" && updatedValue) {
        newPermissions[formattedModule]["delete"] = true;
        newPermissions[formattedModule]["view"] = true;
      }
  
      // If "edit" is checked, auto-check delete & view
      if (action === "edit" && updatedValue) {
        newPermissions[formattedModule]["delete"] = true;
        newPermissions[formattedModule]["view"] = true;
      }
  
      // If "delete" is checked, auto-check view
      if (action === "delete" && updatedValue) {
        newPermissions[formattedModule]["view"] = true;
      }
  
      // If full Access is manually checked, check everything
      if (action === "fullAccess" && updatedValue) {
        // Check all actions for this module
        actions.forEach((act) => {
          newPermissions[formattedModule][act] = true;
        });
      }
  
      // If full Access is manually unchecked, uncheck everything
      if (action === "fullAccess" && !updatedValue) {
        // Uncheck all actions for this module
        actions.forEach((act) => {
          newPermissions[formattedModule][act] = false;
        });
      }
  
      // Auto-manage full Access if all basic actions are true
      const allBasicChecked = actions
        .filter((a) => a !== "fullAccess")
        .every((a) => newPermissions[formattedModule]?.[a]);
  
      newPermissions[formattedModule]["fullAccess"] = allBasicChecked;
  
      return newPermissions;
    });
  };
  
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Title',
        text: 'Please enter a role title before saving.',
      });
      return;
    }
    const finalPermissions = {};
    modules.forEach((module) => {
      const formattedModule = module.replace(/\s+/g, "");
      finalPermissions[formattedModule] = {};

      actions.forEach((action) => {
        finalPermissions[formattedModule][action] = permissions[formattedModule]?.[action] || false;
      });
    });
    otherModules.forEach((module) => {
      const formattedModule = module.replace(/\s+/g, "");
      finalPermissions[formattedModule] = {};
      other_Actions.forEach((action) => {
        finalPermissions[formattedModule][action] =
          permissions[formattedModule]?.[action] || false;
      });
    });

    const defaultPermissionLevel = rolePermissionLevels[title] || 6;
    const roleData = {
      title,
      description,
      permissions: finalPermissions,
      createdBy: userData?.user.id,
      defaultPermissionLevel,
    };

    try {
      setLoading(true); // ✅ Show loader
      await createRole(roleData);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Role Created Successfully!',
      });
      navigate("/roles");
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error?.response?.data?.message || "Something went wrong!"
      });
    } finally {
      setLoading(false); // ✅ Hide loader
    }
  };

  const handleInputClick = () => {
    setDropdownOpen(true);
  };
  return (
    <Layout>
      <div className="create-role-container">
        <div className="createrole-header">
        <button className="createrole-back-btn" onClick={() => navigate(-1)}><IoArrowBack /></button>
        <h2>Create New Role</h2>
        </div>
        <div className="input-group">
          <label>Role Title:</label>
          <div className="autocomplete-container">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDropdownOpen(true); // Open suggestions while typing
              }}
              required
              onClick={handleInputClick}
              placeholder="Select role..."
              className="custom-input"
            />
            {isDropdownOpen && availableRoles.length > 0 && (
              <ul className="suggestions-list" ref={suggestionBoxRef}>
                {availableRoles
                  .filter((role) => role.toLowerCase().includes(title.toLowerCase())) // Filter suggestions
                  .map((role, index) => (
                    <li key={index} onClick={() => selectSuggestion(role)}>
                      {role}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <div className="input-group">
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
          />
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
              const formattedModule = module.replace(/\s+/g, "");
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
        <table className="permissions-table">
  <thead>
    <tr>
      <th>Module</th>
      {other_Actions.map((action) => (
        <th key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {otherModules.map((module) => {
      const formattedModule = module.replace(/\s+/g, "");
      return (
        <tr key={module}>
          <td>{module}</td>
          {other_Actions.map((action) => (
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
          <button className="submit-btn" onClick={handleSubmit} >
            Save Role
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRole;
