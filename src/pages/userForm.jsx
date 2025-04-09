import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { registerUser, editUser, getRoles, getAllUsers } from "../lib/api";
import Swal from "sweetalert2";
import "../styles/users.css";
import { IoArrowBack } from "react-icons/io5";
import Loader from "../components/Loader";
import Required from "../components/Required";
import { toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "../components/BackButton";
const roleLevels = {
  "Admin" : 1 , 
  "Super Admin": 1,
  "Account Manager": 2,
  "Sr. Designer": 3,
  "Operation": 4,
  "Junior Designer": 5,
  "Lead Installer" : 6
};

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);

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
    roleId: null
  };
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
    const passwordRegex = /^[A-Za-z0-9]{6,20}$/;

    switch (name) {
      case "firstName":
        newErrors.firstName = !value
          ? "First Name is required"
          : !nameRegex.test(value)
            ? "First Name must contain only letters"
            : "";
        break;
      case "lastName":
        newErrors.lastName = !value
          ? "Last Name is required"
          : !nameRegex.test(value)
            ? "Last Name must contain only letters"
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
            : !passwordRegex.test(value)
              ? "Password must be 6-20 characters long (no spaces or special characters)"
              : "";
          break;
      case "userRole":
        newErrors.userRole = !value ? "Role is required" : "";
        break;
      default:
        break;
    }
console.log("eerror p " , newErrors?.password)
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
  const validateForm = (user) => {
    const newErrors = {};
    const fields = ["firstName", "lastName", "email", "mobileNumber", "userRole"];
    if (!isEditMode) fields.push("password");
  
    fields.forEach((field) => validateField(field, user[field]));
  
    setErrors(newErrors); // ✅ Ensure state is updated before checking errors
  
    return Object.values(newErrors).some((error) => error !== ""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regex patterns
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const passwordRegex = /^[A-Za-z0-9]{6,20}$/;

    // Validation (Only one toast at a time)
    if (!newUser.firstName) return toast.error("First Name is required", { toastId: "firstName" });
    if (!nameRegex.test(newUser.firstName)) return toast.error("First Name must contain only letters", { toastId: "firstName" });

    if (!newUser.lastName) return toast.error("Last Name is required", { toastId: "lastName" });
    if (!nameRegex.test(newUser.lastName)) return toast.error("Last Name must contain only letters", { toastId: "lastName" });

    if (!newUser.email) return toast.error("Email is required", { toastId: "email" });
    if (!emailRegex.test(newUser.email)) return toast.error("Enter a valid email address", { toastId: "email" });

    if (!newUser.mobileNumber) return toast.error("Mobile Number is required", { toastId: "mobileNumber" });
    if (!mobileRegex.test(newUser.mobileNumber)) return toast.error("Enter a valid 10-digit mobile number", { toastId: "mobileNumber" });

    if (!newUser.userRole) return toast.error("Role is required", { toastId: "userRole" });

    if (!isEditMode) {
        if (!newUser.password) return toast.error("Password is required", { toastId: "password" });
        if (!passwordRegex.test(newUser.password)) return toast.error("Password must be 6-20 characters long (no spaces or special characters)", { toastId: "password" });
    }

    try {
        setLoading(true);
        if (isEditMode) {
            await editUser(id, newUser);
            toast.success("User updated successfully!", { toastId: "success" });
        } else {
            await registerUser(newUser);
            toast.success("User added successfully!", { toastId: "success" });
        }
        navigate("/users");
    } catch (err) {
        toast.error(err.message || "Something went wrong!", { toastId: "error" });
    } finally {
        setLoading(false);
    }
};


  console.log({newUser})

  return (
    <Layout>
      <div className="user-form-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
        <div className="user-form-header">
        <BackButton/>
          <h2 className="user-form-title">{isEditMode ? "Edit User" : "Add User"}</h2>
        </div>
        {loading ? <Loader/> :  <form className="user-form-container user-form" onSubmit={handleSubmit}>
          <div className="user-form-row">
            <div className="user-form-group">
              <label>First Name <Required/></label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={handleChange}
                max={20}
              />
              {/* {errors.firstName && <p className="user-error">{errors.firstName}</p>} */}
            </div>
            <div className="user-form-group">
              <label>Last Name <Required/></label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={handleChange}
                max={20}
              />
              {/* {errors.lastName && <p className="user-error">{errors.lastName}</p>} */}
            </div>
          </div>

          <div className="user-form-row">
            <div className="user-form-group">
              <label>Email <Required/></label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleChange}
                maxLength={40}
              />
              {/* {errors.email && <p className="user-error">{errors.email}</p>} */}
            </div>
          {/* </div> */}

          {/* <div className="user-form-row"> */}
            <div className="user-form-group">
              <label>Password <Required/></label>
              <input
  type="password"
  name="password"
  placeholder="Password"
  value={newUser.password}
  onChange={(e) => {
    // Remove spaces and emojis while allowing letters and numbers
    const noSpaceEmojiValue = e.target.value.replace(/[\s\p{Extended_Pictographic}]/gu, '');
    setNewUser({ ...newUser, password: noSpaceEmojiValue });
  }}
  onKeyDown={(e) => {
    // Block spaces and emojis
    if (e.key === " " || e.key.match(/[\p{Extended_Pictographic}]/u)) {
      e.preventDefault();
    }
  }}
  
/>

              {/* {errors.password && <p className="user-error">{errors.password}</p>} */}
            </div>
          </div>


            <div className="user-form-group mobnumber">
              <label>Mobile Number <Required/></label>
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

          <div className="user-form-row">
            <div className="user-form-group">
              <label>Select a Role <Required/></label>
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

          <button type="submit" className="user-submit-btn">
            {isEditMode ? "Update User" : "Add User"}
          </button>
        </form>} 
       
      </div>
    </Layout>
  );
};

export default UserForm;
