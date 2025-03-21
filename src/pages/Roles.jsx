import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getRoles, deleteRole } from "../lib/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/Roles.css";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const data = await getRoles();
    setRoles(data.data);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteRole(id);
        setRoles(roles.filter((role) => role.id !== id));
        Swal.fire("Deleted!", "The role has been deleted.", "success");
      }
    });
  };

  return (
    <Layout>
      <div className="roles-container">
        <div className="roles-header">
          <button className="add-role-btn" onClick={() => navigate("/create-role")}>
            + Add Role
          </button>
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <table className="roles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles
              .filter((role) => role.title.toLowerCase().includes(search.toLowerCase()))
              .map((role, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{role.title}</td>
                  <td>{role.desc}</td>
                  <td className="actions">
                    <FaEdit className="edit-icon" title="Edit" onClick={() => navigate(`/edit-role/${role.id}`)} />
                    <FaTrash className="delete-icon" title="Delete" onClick={() => handleDelete(role.id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Roles;
