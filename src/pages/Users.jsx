import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal/Model";
import { registerUser, getAllUsers, deleteUser } from "../lib/api"; // Fetch users API add kiya
import "../styles/users.css";
import { GrAdd } from "react-icons/gr";
import "../styles/Roles.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  let createdBYId = JSON.parse(localStorage.getItem("user"))
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    userRole: "",
    createdBy: createdBYId?.user.id
  });
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchUsers();
  }, [isModalOpen]);

  useEffect(()=> {
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobileNumber: "",
      userRole: "",
      // createdBy: createdBYId?.user.id
    })
  },[isModalOpen])

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
  
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();

      // LocalStorage se logged-in user ka data lo
      const loggedInUser = JSON.parse(localStorage.getItem("user"));

      if (!loggedInUser) {
        console.error("No logged-in user found");
        return;
      }


      if (loggedInUser?.user.userRole === "superadmin") {
        setUsers(data);
      } else {
        if (loggedInUser) {
          const filteredUsers = data.filter(user => user.createdBy === loggedInUser.id);
          setUsers(filteredUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const addUser = async () => {
    try {
      const res = await registerUser(newUser);
      setUsers([...users, res.user]);
      setModalOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        mobileNumber: "",
        userRole: "",
        createdBy: createdBYId.user.id
      })
      alert("User Registered Successfully");
    } catch (error) {
      alert(error.message || "Error registering user");
    }
  };

  return (
    <Layout>
      <div className="roles-container">
        <h2>Users</h2>
        <div className="roles-header">
          <button onClick={() => setModalOpen(true)} className="add-user-btn">
            <GrAdd /> Add User
          </button>
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) =>
                `${user.firstName} ${user.lastName} ${user.email} ${user.userRole}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.userRole || "N/A"}</td>
                  <td>
                    {user.creator
                      ? `${user.creator.firstName} (${user.creator.email})`
                      : "Self / N/A"}
                  </td>
                  <td className="actions">
                    <FaEdit className="edit-icon" title="Edit" />
                    <FaTrash className="delete-icon" title="Delete" onClick={() => handleDeleteUser(user.id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New User"
      >
        <form
          className="form-container"
          onSubmit={(e) => {
            e.preventDefault(); // prevent page reload
            addUser(); // trigger user registration
          }}
        >

          <input
            type="text"
            placeholder="First Name"
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={newUser.mobileNumber}
            onChange={(e) =>
              setNewUser({ ...newUser, mobileNumber: e.target.value })
            }
            required
          />

          {/* Role Dropdown */}
          <select
            value={newUser.userRole}
            onChange={(e) =>
              setNewUser({ ...newUser, userRole: e.target.value })
            }
            required
          >
            <option value="">Select Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="accountmanager">Account Manager</option>
            <option value="sr_designer">Senior Designer</option>
          </select>

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </Modal>
    </Layout>
  );
};

export default Users;
