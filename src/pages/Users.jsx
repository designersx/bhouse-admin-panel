import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal/Model";
import { registerUser, getRoles ,  getAllUsers, deleteUser, editUser } from "../lib/api";
import "../styles/users.css";
import { GrAdd } from "react-icons/gr";
import "../styles/Roles.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    
      const itemsPerPage = 3; // Show 3 items per page
  let createdBYId = JSON.parse(localStorage.getItem("user"));

  const defaultUserState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    userRole: "",
    status: "active",
    createdBy: createdBYId?.user.id,
  };
  const roleLevels = {
    "Super Admin": 1,
    "Account Manager": 2,
    "Sr. Designer": 3,
    "Designer": 4,
    "Intern": 5,
  };
  const [newUser, setNewUser] = useState(defaultUserState);
  const [errors, setErrors] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  useEffect(() => {
    fetchUsers();
  }, [isModalOpen]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      const loggedInUser = JSON.parse(localStorage.getItem("user"));

      if (loggedInUser?.user.userRole === "superadmin") {
        setUsers(data);
      } else {
        const filteredUsers = data.filter(user => user.createdBy === loggedInUser?.user.id);
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const validateForm = (user) => {
    let errors = {};
    if (!user.firstName) errors.firstName = "First Name is required";
    if (!user.lastName) errors.lastName = "Last Name is required";
    if (!user.email) errors.email = "Email is required";
    if (!user.mobileNumber) errors.mobileNumber = "Mobile Number is required";
    if (!isEditMode && !user.password) errors.password = "Password is required";
    if (!user.userRole) errors.userRole = "Role is required";
    return errors;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    let validationErrors = validateForm(newUser);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await registerUser(newUser);
      setModalOpen(false);
      setNewUser(defaultUserState);
      setErrors({});
      Swal.fire({
        icon: "success",
        title: "User Added",
        text: "User has been successfully added.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add user.",
      });
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser({ ...user });
    setNewUser({
      ...user,
      password: "",
    });
    setIsEditMode(true);
    setModalOpen(true);
    setErrors({});
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    let validationErrors = validateForm(newUser);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await editUser(selectedUser.id, newUser);
      setModalOpen(false);
      setIsEditMode(false);
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update user.",
      });
    }
  };
 // ✅ Search and Pagination Logic
 const filteredUsers = users.filter(user =>
  user.firstName.toLowerCase().includes(search.toLowerCase()) ||
  user.lastName.toLowerCase().includes(search.toLowerCase()) ||
  user.email.toLowerCase().includes(search.toLowerCase()) ||
  user.userRole.toLowerCase().includes(search.toLowerCase()) ||
  user.status.toLowerCase().includes(search.toLowerCase())
);

const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

const handleSearchChange = (e) => {
  setSearch(e.target.value);
  setCurrentPage(1);  
};
const generatePageNumbers = (currentPage, totalPages) => {
  const pages = [];
  if (totalPages <= 4) {
    
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1); 
    if (currentPage > 3) pages.push("..."); 

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
};
console.log(roleLevels["Account Manager"] , "role value")
const fetchRoles = async () => {
  try {
    const response = await getRoles(); 
    const allRoles = response.data; 
    console.log("Fetched Roles:", allRoles); 

    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedInUser?.user) return;

    const userRole = loggedInUser.user.userRole; 
    const userLevel = roleLevels[userRole] ; 

    
    const filteredRoles = allRoles.filter(role =>
      
      role.createdBy === loggedInUser.user.id ||
      
      (role.defaultPermissionLevel > userLevel && role.defaultPermissionLevel !== 6) ||
  
      (userRole === "Super Admin" && role.title === "Super Admin")
    );

    setAvailableRoles(filteredRoles); 
    console.log("Filtered Roles:", filteredRoles); 
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};
useEffect(() => {
  if (isModalOpen) {
    fetchRoles();
  }
}, [isModalOpen]);
const handleDeleteUser = async (id) => {
  const confirmResult = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this user?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (confirmResult.isConfirmed) {
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User has been deleted successfully.",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while deleting the user.",
      });
    }
  }
};
  return (
    <Layout>
      <div className="roles-container">
        <h2>Users</h2>
        <div className="roles-header">
          <button onClick={() => { setModalOpen(true); setIsEditMode(false); setNewUser(defaultUserState); }} className="add-user-btn">
            <GrAdd /> Add User
          </button>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <table className="roles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.userRole || "N/A"}</td>
                  <td className={user.status === "active" ? "status_active" : "status_inactive"}>
                    {user.status === "active" ? " Active" : " Inactive"}
                  </td>
                  <td className="actions">
                    <FaEdit className="edit-icon" title="Edit" onClick={() => handleEditClick(user)} />
                    <FaTrash className="delete-icon" title="Delete" onClick={()=>handleDeleteUser(user.id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="icon-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>

            {generatePageNumbers(currentPage, totalPages).map((page, index) => (
              <div
                key={index}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
              >
                {page}
              </div>
            ))}

            <button
              className="icon-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? "Edit User" : "Add User"}>
        <form className="form-container" onSubmit={isEditMode ? handleUpdateUser : handleAddUser}>
          <input
            type="text"
            placeholder="First Name"
            value={newUser.firstName}
            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <input
            type="text"
            placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}

          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          {!isEditMode && (
            <>
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </>
          )}

          <input
            type="text"
            placeholder="Mobile Number"
            value={newUser.mobileNumber}
            onChange={(e) => setNewUser({ ...newUser, mobileNumber: e.target.value })}
          />
          {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}

          <select
  value={newUser.userRole}
  onChange={(e) => setNewUser({ ...newUser, userRole: e.target.value })}
>
  <option value="">Select a Role</option>
  {availableRoles.map((role) => (
    <option key={role.id} value={role.title}>
      {role.title} (Level {roleLevels[role.title] || "Unknown"})
    </option>
  ))}
</select>

          <select value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}>
            <option  value="active">Active</option>
            <option  value="inactive">Inactive</option>
          </select>

          <button type="submit" className="submit-btn">{isEditMode ? "Update User" : "Add User"}</button>
        </form>
      </Modal>
    </Layout>
  );
};

export default Users;
