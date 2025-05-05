import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import Swal from "sweetalert2";
import "../../styles/Projects/project.css";
import { url } from "../../lib/api";
import Loader from "../../components/Loader";
import BackButton from "../../components/BackButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ArchivedProjects = () => {
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchArchivedProjects = async () => {
      try {
        const res = await axios.get(`${url}/projects/archived`);
        const formatted = res.data.map((project) => ({
          ...project,
          assignedTeam: Array.isArray(project.assignedTeamRoles)
            ? project.assignedTeamRoles.map((role) => `${role.role}`).join(", ")
            : "N/A",
          startDateFormatted: new Date(project.startDate).toLocaleDateString(),
          completionDateFormatted: project.estimatedCompletion
            ? new Date(project.estimatedCompletion).toLocaleDateString()
            : "N/A",
        }));
        setArchivedProjects(formatted);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching archived projects", error);
        setLoading(false);
      }
    };

    fetchArchivedProjects();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleUnarchive = async (projectId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unarchive this project?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, unarchive it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axios.patch(`${url}/projects/${projectId}/unarchive`);
        if (res.status === 200) {
          toast.success("Project unarchived successfully!");
          setArchivedProjects((prev) => prev.filter((p) => p.id !== projectId));
        }
      } catch (err) {
        console.error("Error unarchiving:", err);
        toast.error("Failed to unarchive project.");
      }
    }
  };

  const filteredProjects = archivedProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.clientName.toLowerCase().includes(searchQuery)
  );

  const generatePageNumbers = (current, totalPages) => {
    const pages = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      let start = Math.max(2, current - 1);
      let end = Math.min(totalPages - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="roles-container">
        <div className="project-first-header">
          <BackButton />
          <h2>Archived Projects</h2>
        </div>

<<<<<<< HEAD
      <div className="projects-table-container">
        {loading ? (
          <Loader/>
        ) : filteredProjects.length === 0 ? (
          <p>No archived projects found.</p>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client Name</th>
                <th>Status</th>
                <th>Assigned Roles</th>
                <th>Type</th>
                <th>Est. Completion</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.clientName}</td>
                  <td>{project.status}</td>
                  <td>{project.assignedTeam}</td>
                  <td>{project.type}</td>
                  <td>{project.estimatedCompletion?.match(/\d+/)?.[0]} Weeks</td>

                  <td>
                    <button
                      className="add-user-btna"
                      onClick={() => handleUnarchive(project.id)}
=======
        <div className="user-roles-header">
          <div className="user-roles-headerb">
            <input
              type="text"
              className="user-search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="roles-table">
          {loading ? (
            <Loader />
          ) : filteredProjects.length === 0 ? (
            <p style={{ textAlign: "center" }}>No archived projects found.</p>
          ) : (
            <>
              <table className="projects-table sticky-header">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Project Name</th>
                    <th>Client Name</th>
                    <th>Status</th>
                    <th>Assigned Roles</th>
                    <th>Type</th>
                    <th>Est. Completion</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((project, index) => (
                      <tr key={project.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{project.name}</td>
                        <td>{project.clientName}</td>
                        <td>{project.status}</td>
                        <td>{project.assignedTeam}</td>
                        <td>{project.type}</td>
                        <td>{project.estimatedCompletion?.match(/\d+/)?.[0]} Weeks</td>
                        <td>
                          <button
                            className="add-user-btn"
                            onClick={() => handleUnarchive(project.id)}
                          >
                            Unarchive
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {filteredProjects.length > itemsPerPage && (
                <div className="pagination">
                  <button
                    className="icon-btn"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    ◀
                  </button>

                  {generatePageNumbers(
                    currentPage,
                    Math.ceil(filteredProjects.length / itemsPerPage)
                  ).map((page, index) => (
                    <div
                      key={index}
                      className={`page-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => typeof page === "number" && setCurrentPage(page)}
>>>>>>> bhouse/main
                    >
                      {page}
                    </div>
                  ))}

                  <button
                    className="icon-btn"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === Math.ceil(filteredProjects.length / itemsPerPage)}
                  >
                    ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ArchivedProjects;
