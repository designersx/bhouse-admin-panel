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
  const [errors, setErrors] = useState({});


  useEffect(() => {
    fetchUsers();
  }, [isModalOpen]);

  useEffect(() => {
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobileNumber: "",
      userRole: "",
      // createdBy: createdBYId?.user.id
    })
    setErrors({})
  }, [isModalOpen])

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
          const filteredUsers = data.filter(user => user.createdBy === loggedInUser?.user.id);
          setUsers(filteredUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "firstName":
      case "lastName":
        if (!/^[A-Za-z\s]+$/.test(value)) {
          error = "Only letters are allowed.";
        }
        break;
        case "email":
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            error = "Please enter a valid email address.";
          }
          break;
      case "password":
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value)) {
          error = "Min 6 characters with 1 number.";
        }
        break;
      case "mobileNumber":
        if (!/^[0-9]{10}$/.test(value)) {
          error = "Enter 10 digit number.";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
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
      });
      Swal.fire({
        icon: "success",
        title: "Registered!",
        text: "User Registered Successfully",
        timer: 1000,
        showConfirmButton: false
      });
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
            onChange={(e) => {
              setNewUser({ ...newUser, firstName: e.target.value });
              validateField("firstName", e.target.value);
            }}
            required
          />
          {errors.firstName && <small className="error-text">{errors.firstName}</small>}

          <input
            type="text"
            placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) => {
              setNewUser({ ...newUser, lastName: e.target.value })
              validateField("lastName", e.target.value);
            }}
            required
          />
          {errors.lastName && <small className="error-text">{errors.firstName}</small>}

          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => {
              setNewUser({ ...newUser, email: e.target.value })
              validateField("email", e.target.value);
            }}
            required
          />
          {errors.email && <small className="error-text">{errors.firstName}</small>}

          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => {
              setNewUser({ ...newUser, password: e.target.value })
              validateField("password", e.target.value);
            }}
            maxLength={6}
            required
          />
          {errors.password && <small className="error-text">{errors.firstName}</small>}

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Mobile Number"
            value={newUser.mobileNumber}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
              setNewUser({ ...newUser, mobileNumber: onlyNums });
              validateField("mobileNumber", onlyNums);
            }}
            required
          />
          {errors.mobileNumber && <small className="error-text">{errors.mobileNumber}</small>}

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
