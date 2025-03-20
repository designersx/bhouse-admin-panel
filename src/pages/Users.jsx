import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal/Model";
import { registerUser, getAllUsers , deleteUser } from "../lib/api"; // Fetch users API add kiya
import "../styles/users.css";
import { MdDelete} from "react-icons/md";
import { GrAdd } from "react-icons/gr";
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
    createdBy : createdBYId.user.id
  });

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        setUsers(users.filter(user => user.id !== id)); // Remove user from state
        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
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
      
        const filteredUsers = data.filter(user => user.createdBy === loggedInUser.id);
        setUsers(filteredUsers);
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
      alert("User Registered Successfully");
    } catch (error) {
      alert(error.message || "Error registering user");
    }
  };

  return (
    <Layout>
      <h2>Users</h2>
      <button onClick={() => setModalOpen(true)} className="add-user-btn">
      <GrAdd /> Add User
      </button>

      <table>
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
          {users.map((user) => (
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
              <td>
                <button className="deleteBtn" onClick={() => handleDeleteUser(user.id)}><MdDelete /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New User"
      >
        <div className="form-container">
          <input
            type="text"
            placeholder="First Name"
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={newUser.mobileNumber}
            onChange={(e) =>
              setNewUser({ ...newUser, mobileNumber: e.target.value })
            }
          />

          {/* Role Dropdown */}
          <select
            value={newUser.userRole}
            onChange={(e) =>
              setNewUser({ ...newUser, userRole: e.target.value })
            }
          >
            <option value="">Select Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="accountmanager">Account Manager</option>
            <option value="sr_designer">Senior Designer</option>
          </select>

          <button onClick={addUser} className="submit-btn">
            Register
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Users;
