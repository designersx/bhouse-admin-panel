import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { registerUser, editUser, getRoles, getAllUsers } from "../lib/api";
import Swal from "sweetalert2";
import "../styles/users.css";
import Loader from "../components/Loader";
import Required from "../components/Required";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "../components/BackButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const roleLevels = {
  "Admin": 1,
  "Super Admin": 1,
  "Account Manager": 2,
  "Sr. Designer": 3,
  "Operation": 4,
  "Junior Designer": 5,
  "Lead Installer": 6
};

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialChar: false,
});
const [showPasswordModal, setShowPasswordModal] = useState(false);


  const createdBYId = JSON.parse(localStorage.getItem("user"));
  const defaultUserState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    userRole: "",
    status: "active",
    createdBy: createdBYId?.user.id,
    roleId: null , 
  mettingLink : ""  };
  const [newUser, setNewUser] = useState(defaultUserState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchUsersAndSetForm();
    }
    fetchRoles();
  }, [id]);

  const fetchUsersAndSetForm = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      const user = data.find((u) => u.id === parseInt(id));
      if (user) {
        setNewUser({ ...user });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      const allRoles = response.data;

      const userRole = createdBYId.user.userRole;
      const userId = createdBYId.user.id;
      const userLevel = roleLevels[userRole];

      let filteredRoles = [];

      if (userRole === "Super Admin") {
        filteredRoles = allRoles;
      }
      else if (userRole === "Admin") {
        filteredRoles = allRoles.filter(role => role.title !== "Super Admin");
      } else {
        filteredRoles = allRoles.filter((role) => {
          const isPredefinedAndAbove = role.defaultPermissionLevel < 7 && role.defaultPermissionLevel > userLevel;
          const isCustomAndCreatedByUser = role.defaultPermissionLevel === 7 && String(role.createdBy) === String(userId);
          return isPredefinedAndAbove || isCustomAndCreatedByUser;
        });
      }

      setAvailableRoles(filteredRoles);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
    }
  };


  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
    switch (name) {
      case "firstName":
        newErrors.firstName = !value
          ? "First Name is required"
          : !nameRegex.test(value)
            ? "First Name must contain only letters"
            : !/^[A-Z]/.test(value)
              ? "First Name must start with a capital letter"
              : "";
        break;

      case "lastName":
        newErrors.lastName = !value
          ? "Last Name is required"
          : !nameRegex.test(value)
            ? "Last Name must contain only letters"
            : !/^[A-Z]/.test(value)
              ? "Last Name must start with a capital letter"
              : "";
        break;

      case "email":
        newErrors.email = !value
          ? "Email is required"
          : !emailRegex.test(value)
            ? "Enter a valid email address"
            : "";
        break;

      case "mobileNumber":
        newErrors.mobileNumber = !value
          ? "Mobile Number is required"
          : !mobileRegex.test(value)
            ? "Enter a valid 10-digit number"
            : "";
        break;

      case "password":
        newErrors.password = !value
          ? "Password is required"
          : !strongPasswordRegex.test(value)
            ? "Password must be 6–20 characters and include uppercase, lowercase, number and special character"
            : "";
        break;

      case "userRole":
        newErrors.userRole = !value ? "Role is required" : "";
        break;

      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "userRole") {
      const selectedRole = availableRoles.find((role) => role.title === value);
      setNewUser((prev) => ({
        ...prev,
        userRole: value,
        roleId: selectedRole ? selectedRole.id : null,
      }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }

    validateField(name, value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regex patterns
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;

    // Validation (Only one toast at a time)
    if (!newUser.firstName) return toast.error("First Name is required", { toastId: "firstName" });
    if (!nameRegex.test(newUser.firstName)) return toast.error("First Name must contain only letters", { toastId: "firstName" });
    if (!/^[A-Z]/.test(newUser.firstName)) return toast.error("First Name must start with a capital letter", { toastId: "firstName" });

    if (!newUser.lastName) return toast.error("Last Name is required", { toastId: "lastName" });
    if (!nameRegex.test(newUser.lastName)) return toast.error("Last Name must contain only letters", { toastId: "lastName" });
    if (!/^[A-Z]/.test(newUser.lastName)) return toast.error("Last Name must start with a capital letter", { toastId: "lastName" });


    if (!newUser.email) return toast.error("Email is required", { toastId: "email" });
    if (!emailRegex.test(newUser.email)) return toast.error("Enter a valid email address", { toastId: "email" });

    if (!newUser.mobileNumber) return toast.error("Mobile Number is required", { toastId: "mobileNumber" });
    if (!mobileRegex.test(newUser.mobileNumber)) return toast.error("Enter a valid 10-digit mobile number", { toastId: "mobileNumber" });

    if (!newUser.userRole) return toast.error("Role is required", { toastId: "userRole" });
    if (!isEditMode) {
      if (!newUser.password) {
        return Swal.fire({
          icon: "warning",
          title: "Password Required",
          text: "Please enter a password to proceed.",
        });
      }
  
      if (!strongPasswordRegex.test(newUser.password)) {
        return Swal.fire({
          icon: "error",
          title: "Weak Password",
          html: `
            <div style="text-align: left;">
              Your password must meet the following requirements:
              <ul style="margin-top: 8px;">
                <li>✅ 6–20 characters long</li>
                <li>✅ At least one uppercase letter (A–Z)</li>
                <li>✅ At least one lowercase letter (a–z)</li>
                <li>✅ At least one number (0–9)</li>
                <li>✅ At least one special character (@, $, !, %, *, ?, &)</li>
              </ul>
            </div>
          `,
        });
      }
    } else {
      // In edit mode, validate password only if it's provided
      if (newUser.password && !strongPasswordRegex.test(newUser.password)) {
        return Swal.fire({
          icon: "error",
          title: "Weak Password",
          html: `
            <div style="text-align: left;">
              Your password must meet the following requirements:
              <ul style="margin-top: 8px;">
                <li>✅ 6–20 characters long</li>
                <li>✅ At least one uppercase letter (A–Z)</li>
                <li>✅ At least one lowercase letter (a–z)</li>
                <li>✅ At least one number (0–9)</li>
                <li>✅ At least one special character (@, $, !, %, *, ?, &)</li>
              </ul>
            </div>
          `,
        });
      }
    }
  
    try {
      setLoading(true);
      if (isEditMode) {
        await editUser(id, newUser);
        toast.success("User updated successfully!", { toastId: "success" });
      } else {
        await registerUser({ ...newUser, sendCredentials });
        toast.success("User added successfully!", { toastId: "success" });
      }
      navigate("/users");
    } catch (err) {
      toast.error(err.message || "Something went wrong!", { toastId: "error" });
    } finally {
      setLoading(false);
    }
  };


  console.log({ newUser })

  return (
    <Layout>
      <div className="user-form-wrapper">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="user-form-header">
          <BackButton />
          <h2 className="user-form-title">{isEditMode ? "Edit User" : "Add User"}</h2>
        </div>
        {loading ? <Loader /> : <form className="user-form-container user-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="user-form-row">
            <div className="user-form-group">
              <label>First Name <Required /></label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={handleChange}
                maxLength={20}
                autocomplete="off"
              />
              <small style={{ fontSize: "0.8rem", color: "#777" }}>
                Must start with a capital letter and contain only letters.
              </small>
              {/* {errors.firstName && <p className="user-error">{errors.firstName}</p>} */}
            </div>
            <div className="user-form-group">
              <label>Last Name <Required /></label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={handleChange}
                maxLength={20}
              />
              <small style={{ fontSize: "0.8rem", color: "#777" }}>
                Must start with a capital letter and contain only letters.
              </small>
              {/* {errors.lastName && <p className="user-error">{errors.lastName}</p>} */}
            </div>
          </div>

          <div className="user-form-row">
            <div className="user-form-group">
              <label>Email <Required /></label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleChange}
                maxLength={40}
                autocomplete="off"
              />
              {/* {errors.email && <p className="user-error">{errors.email}</p>} */}
            </div>
            {/* </div> */}

            {/* <div className="user-form-row"> */}
            <div className="user-form-group">
  <label>
    Password <Required />
  </label>
  
  <div className="password-input-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Password"
      maxLength={20}
      value={newUser.password}
     onChange={(e) => {
  const noSpaceEmojiValue = e.target.value.replace(/[\s\p{Extended_Pictographic}]/gu, '');
  setNewUser({ ...newUser, password: noSpaceEmojiValue });

  // Update password rules state
  const updatedRules = {
    length: noSpaceEmojiValue.length >= 6 && noSpaceEmojiValue.length <= 20,
    uppercase: /[A-Z]/.test(noSpaceEmojiValue),
    lowercase: /[a-z]/.test(noSpaceEmojiValue),
    number: /\d/.test(noSpaceEmojiValue),
    specialChar: /[@$!%*?&]/.test(noSpaceEmojiValue),
  };
  setPasswordRules(updatedRules);

  // Show/Hide Modal based on password field being non-empty
  if (noSpaceEmojiValue.length > 0) {
    setShowPasswordModal(true);
  } else {
    setShowPasswordModal(false);
  }

  // Auto hide if all rules met
  const allValid = Object.values(updatedRules).every(Boolean);
  if (allValid) {
    setShowPasswordModal(false);
  }
}}

      onKeyDown={(e) => {
        if (e.key === " " || e.key.match(/[\p{Extended_Pictographic}]/u)) {
          e.preventDefault();
        }
      }}
      className="user-password-input"
    />

    <span
      className="toggle-password-icon"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

          </div>


          <div className="user-form-group mobnumber">
            <label>Mobile Number <Required /></label>
            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={newUser.mobileNumber}
              onChange={handleChange}
              maxLength={10}
            />
            {errors.mobileNumber && <p className="user-error">{errors.mobileNumber}</p>}
          </div>
           <div className="user-form-group mobnumber">
              <label>Meeting Link</label>
              <input
                type="text"
                name="mettingLink"
                placeholder="Metting Link"
                value={newUser.mettingLink}
                onChange={handleChange}
                
            
              />
              
              
              {/* {errors.firstName && <p className="user-error">{errors.firstName}</p>} */}
            </div>

          <div className="user-form-row">
            <div className="user-form-group">
              <label>Select a Role <Required /></label>
              <select
                name="userRole"
                value={newUser.userRole}
                onChange={handleChange}
                required
              >
                <option value="">Select a Role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.title}>
                    {role.title}
                  </option>
                ))}
              </select>
              {errors.userRole && <p className="user-error">{errors.userRole}</p>}
            </div>

            <div className="user-form-group">
              <label>Status</label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
           
          </div>
          <div className="user-form-row">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={sendCredentials}
                onChange={(e) => setSendCredentials(e.target.checked)}
              />
              Send credentials to user via email
            </label>
          </div>


          <button type="submit" className="user-submit-btn">
            {isEditMode ? "Update User" : "Add User"}
          </button>
        </form>}
{showPasswordModal && (
  <div className="password-modal1">
    <h3>Password Requirements</h3>
    <ul>
      <li>{passwordRules.length ? "✅" : "❌"} 6–20 characters long</li>
      <li>{passwordRules.uppercase ? "✅" : "❌"} At least one uppercase letter (A–Z)</li>
      <li>{passwordRules.lowercase ? "✅" : "❌"} At least one lowercase letter (a–z)</li>
      <li>{passwordRules.number ? "✅" : "❌"} At least one number (0–9)</li>
      <li>{passwordRules.specialChar ? "✅" : "❌"} At least one special character (@, $, !, %, *, ?, &)</li>
    </ul>
  </div>
)}

      </div>
    </Layout>
  );
};

export default UserForm;
