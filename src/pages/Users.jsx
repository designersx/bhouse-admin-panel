import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getAllUsers, deleteUser } from "../lib/api";
import "../styles/users.css";
import { GrAdd } from "react-icons/gr";
import "../styles/Roles.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useRolePermissions from "../hooks/useRolePermissions";
import Loader from "../components/Loader";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
const [isLoading , setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  let createdBYId = JSON.parse(localStorage.getItem("user"));
  const roleId = JSON.parse(localStorage.getItem("user"))
  const { rolePermissions } = useRolePermissions(roleId?.user?.roleId);
  const navigate = useNavigate();


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if(data){
        setIsLoading(false)
      }

      // Define role levels
      const roleLevels = {
        "Super Admin": 1,
        "Account Manager": 2,
        "Sr. Designer": 3,
        "Operations": 4,
        "Lead Installer": 5,
      };

      if (loggedInUser?.user.userRole === "Super Admin") {
        // Super Admin can see all users
        setUsers(data.filter(user => user.id !== loggedInUser?.user.id));
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
          text: "Something went wrong while deleting the user.",
        });
      }
    }
  };

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
        <table className="roles-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Role</th>
              <th>Status</th>
              {(rolePermissions?.UserManagement?.edit || rolePermissions?.UserManagement?.delete) && (
                <th>Actions</th>
              )}
            </tr>
          </thead>
          {isLoading ?  <Loader/> :  <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user , index) => (
                <tr key={user.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> 
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.password}</td>
                  <td>{user.userRole || "N/A"}</td>
                  <td className={user.status === "active" ? "status_active" : "status_inactive"}>
                    {user.status === "active" ? " Active" : " Inactive"}
                  </td>
                  {(rolePermissions?.UserManagement?.edit || rolePermissions?.UserManagement?.delete) ? (
                    <td className="actions">
                      {rolePermissions?.UserManagement?.edit && (
                        <FaEdit
                        style={{
                          color: "black" , 
                          fontSize : "22px"
                        }}
                          title="Edit"
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                        />
                      )}
                      {rolePermissions?.UserManagement?.delete && (
                        <FaTrash
                        style={{
                          color: "black" , 
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
          </tbody> }
         
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
    </Layout>
  );
};

export default Users;