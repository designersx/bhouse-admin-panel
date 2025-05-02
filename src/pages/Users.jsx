import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getAllUsers, deleteUser } from "../lib/api";
import "../styles/users.css";
import "../styles/Roles.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useRolePermissions from "../hooks/useRolePermissions";
import Loader from "../components/Loader";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
const [isLoading , setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const itemsPerPage = 8;
  let createdBYId = JSON.parse(localStorage.getItem("user"));
  const roleId = JSON.parse(localStorage.getItem("user"))
  const { rolePermissions } = useRolePermissions(roleId?.user?.roleId);
  const navigate = useNavigate();


  useEffect(() => {
    fetchUsers();
  }, []);
  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if(data){
        setIsLoading(false)
      }

      // Define role levels
      const roleLevels = {
        "Admin" : 1 , 
        "Super Admin": 1,
        "Account Manager": 2,
        "Sr. Designer": 3,
        "Operations": 4,
        "Junior Designer": 5,
        "Lead Installer" : 6
      };

      if (loggedInUser?.user.userRole === "Super Admin" ) {
        // Super Admin can see all users
        setUsers(data.filter(user => user.id !== loggedInUser?.user.id));
      }
      else if(loggedInUser?.user.userRole === "Admin"){
        setUsers(data.filter(user => user.id !== loggedInUser?.user.id && user?.userRole !=="Super Admin"));

      } else {
        // Filter users based on the logged-in user's role level
        const loggedInUserRoleLevel = roleLevels[loggedInUser?.user.userRole];
        
        // Filter users who have a role level greater than or equal to the logged-in user's role
        const filteredUsers = data.filter(user => {
          const userRoleLevel = roleLevels[user.userRole];
          return userRoleLevel > loggedInUserRoleLevel;
        });

        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
};


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
          text: "User is not deleted.",
        });
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const role = user.userRole.toLowerCase();
    const status = user.status.toLowerCase();
  
    const searchKeywords = search.toLowerCase().split(" ").filter(Boolean); 

    return searchKeywords.every(keyword =>
      fullName.includes(keyword) ||
      email.includes(keyword) ||
      role.includes(keyword) ||
      status.includes(keyword)
    );
  });
  

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

  return (
    <Layout>
      <div className="roles-container">
        <h2>Users</h2>
        <div className="user-roles-header">
          {rolePermissions?.UserManagement?.create ? <button onClick={() => navigate("/users/add")} className="add-user-btn">
             Add User
          </button> : null}

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="user-search-input"
          />
        </div>
        {isLoading ?  <Loader/> : 
        <table className="roles-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th className="name">Name</th>
              <th className="email">Email</th>
              <th className="pass">Password</th>
              <th className="role">Role</th>
              <th className="create">Created By:</th>
              <th>Status</th>
              {(rolePermissions?.UserManagement?.edit || rolePermissions?.UserManagement?.delete) && (
                <th className="action">Actions</th>
              )}
            </tr>
          </thead>
         
          <tbody>
            {paginatedUsers?.length > 0 ? (
              paginatedUsers?.map((user , index) => (
                <tr key={user.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> 
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span>{visiblePasswords[user.id] ? user.password : "•".repeat(user.password.length)}</span>
    {visiblePasswords[user.id] ? (
      <FaEyeSlash
        style={{ cursor: "pointer", color: "#666" }}
        onClick={() => togglePasswordVisibility(user.id)}
        title="Hide Password"
      />
    ) : (
      <FaEye
        style={{ cursor: "pointer", color: "#666" }}
        onClick={() => togglePasswordVisibility(user.id)}
        title="Show Password"
      />
    )}
  </div>
</td>

                  <td>{user.userRole || "N/A"}</td>
                  <td>{user.creator ? `${user.creator.firstName}` : "N/A"}</td>

                  <td className={user.status === "active" ? "status_active" : "status_inactive"}>
                    {user.status === "active" ? " Active" : " Inactive"}
                  </td>
                  {(rolePermissions?.UserManagement?.edit || rolePermissions?.UserManagement?.delete) ? (
                    <td className="actions">
                      {rolePermissions?.UserManagement?.edit && (
                        <FaEdit
                        style={{
                          color: "#004680" , 
                          fontSize : "22px"
                        }}
                          title="Edit"
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                        />
                      )}
                      {rolePermissions?.UserManagement?.delete && (
                        <FaTrash
                        style={{
                          color: "#004680"  , 
                          fontSize : "20px"
                        }}
                          className="delete-icon"
                          title="Delete"
                          onClick={() => handleDeleteUser(user.id)}
                        />
                      )}
                    </td>
                  ) : null}

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No users found</td>
              </tr>
            )}
          </tbody> 
         
        </table>
      }
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="icon-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>

            {generatePageNumbers(currentPage, totalPages)?.map((page, index) => (
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
    </Layout>
  );
};

export default Users;