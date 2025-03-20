import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal/Model';
import { registerUser } from '../lib/api';
import '../styles/users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    userRole: '',
  });

  useEffect(() => {
    // TODO: Fetch Users from API and setUsers
  }, []);

  const addUser = async () => {
    try {
      const res = await registerUser(newUser);
      setUsers([...users, res.user]); // Add new user to state
      setModalOpen(false);
      alert('User Registered Successfully');
    } catch (error) {
      alert(error.message || 'Error registering user');
    }
  };

  return (
    <Layout>
      <h2>Users</h2>
      <button onClick={() => setModalOpen(true)} className="add-user-btn">➕ Add User</button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.userRole}</td>
              <td>
                <button>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding User */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Register New User">
        <div className="form-container">
          <input type="text" placeholder="First Name" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} />
          <input type="text" placeholder="Last Name" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} />
          <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
          <input type="text" placeholder="Mobile Number" value={newUser.mobileNumber} onChange={(e) => setNewUser({...newUser, mobileNumber: e.target.value})} />
          
          {/* Role Dropdown */}
          <select value={newUser.userRole} onChange={(e) => setNewUser({...newUser, userRole: e.target.value})}>
            <option value="">Select Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="accountmanager">Account Manager</option>
            <option value="sr_designer">Senior Designer</option>
          </select>

          <button onClick={addUser} className="submit-btn">Register</button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Users;
