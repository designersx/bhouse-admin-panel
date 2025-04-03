import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoleById, updateRole } from "../lib/api";
import Layout from "../components/Layout";
import Swal from "sweetalert2";
import BackButton from "../components/BackButton";

const predefinedRoles = [
  "Super Admin",
  "Account Manager",
  "Sr. Designer",
  "Operations",
  "Lead Installer",
];

const rolePermissionLevels = {
  "Super Admin": 1,
  "Account Manager": 2,
  "Sr. Designer": 3,
  "Operations": 4,
  "Lead Installer": 5,
};

const modules = [
  "User Management",
  "Project Management",
  "Notification Management",
  "Invoicing and Payment",
  "Installation & Delivery Scheduling",
  "Document Management",
  "Reports & Analytics",
  "Reviews/Feedback & Comments",
  "Customer",
  "Roles"
];

const actions = ["create", "delete", "view", "edit", "fullAccess"];

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [permissions, setPermissions] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);
  const suggestionBoxRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.userRole || "";
  const userPermissionLevel = rolePermissionLevels[userRole] || 5;

  const availableRoles = predefinedRoles.filter(
    (role) => rolePermissionLevels[role] > userPermissionLevel
  );

  useEffect(() => {
    fetchRoleData();
  }, []);

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

  const fetchRoleData = async () => {
    const response = await getRoleById(id);
    if (response.success) {
      let parsedPermissions = {};
      if (typeof response.data.permissions === "string") {
        parsedPermissions = JSON.parse(response.data.permissions);
      } else {
        parsedPermissions = response.data.permissions || {};
      }

      const formattedPermissions = {};
      modules.forEach((module) => {
        const formattedModule = module.replace(/\s+/g, "");
        formattedPermissions[formattedModule] = {};
        actions.forEach((action) => {
          formattedPermissions[formattedModule][action] =
            parsedPermissions[formattedModule]?.[action] || false;
        });
      });

      setTitle(response.data.title);
      setDesc(response.data.description || "");
      setPermissions(formattedPermissions);
    }
  };

  const handleTitleChange = (e) => {
    const inputValue = e.target.value;
    setTitle(inputValue);

    if (inputValue.length > 0) {
      const filteredSuggestions = availableRoles.filter((role) =>
        role.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setDropdownOpen(true);
    } else {
      setSuggestions([]);
      setDropdownOpen(false);
    }
  };

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
      if (action === "edit" && newPermissions[formattedModule][action]) {
        newPermissions[formattedModule]["view"] = true;
      }
      if (action === "fullAccess") {
        const isFullAccess = newPermissions[formattedModule][action];
        actions.forEach((act) => {
          newPermissions[formattedModule][act] = isFullAccess;
        });
      }
      return newPermissions;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalPermissions = {};
    modules.forEach((module) => {
      const formattedModule = module.replace(/\s+/g, "");
      finalPermissions[formattedModule] = {};
      actions.forEach((action) => {
        finalPermissions[formattedModule][action] =
          permissions[formattedModule]?.[action] || false;
      });
    });

    const roleData = { title, description, permissions: finalPermissions, updatedBy: userData?.user.id };

    try {
      await updateRole(id, roleData);
    Swal.fire('Success', 'Role Updated Successfully!', 'success');
    navigate("/roles");
  } catch (error) {
    Swal.fire('Error', '⚠️ Error Updating Role!', 'error');
    }
  };

  return (
    <Layout>
      <div className="create-role-container">
        <BackButton/>
        <h2>Edit Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Role Title:</label>
            <div className="autocomplete-container">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onClick={() => setDropdownOpen(true)}
                placeholder="Select role..."
                className="custom-input"
                required
              />
              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="suggestions-list" ref={suggestionBoxRef}>
                  {suggestions.map((role, index) => (
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
            <input type="text" value={description} onChange={(e) => setDesc(e.target.value)} />
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

          <div className="button-group">
            <button className="submit-btn" type="submit">
              Update Role
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditRole;
