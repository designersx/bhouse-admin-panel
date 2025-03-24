import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import '../../styles/Projects/project.css'; 
import Swal from 'sweetalert2'; 
const ArchivedProjects = () => {
    const [archivedProjects, setArchivedProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    // Fetch archived projects
    const fetchArchivedProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects/archived');
        setArchivedProjects(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching archived projects", error);
      }
    };

    fetchArchivedProjects();
  }, []);

  const handleUnarchiveProject = async (projectId) => {
    // Show SweetAlert2 confirmation dialog before unarchiving
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to unarchive this project.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unarchive it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:5000/api/projects/${projectId}/unarchive`);
        if (response.status === 200) {
          Swal.fire('Unarchived!', 'The project has been unarchived.', 'success');
          setArchivedProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
        }
      } catch (error) {
        Swal.fire('Error!', 'There was an issue unarchiving the project.', 'error');
      }
    }
  };
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    // Filter projects based on project name or client name
    if (query === '') {
      setFilteredProjects(archivedProjects); // If search is empty, show all projects
    } else {
      const filtered = archivedProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.clientName.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    }
  };
  return (
    <Layout>
      <div className="projects-header">
        <h1>Archived Projects</h1>
        <input
          type="text"
          placeholder="Search archived projects..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>
      
      <div className="projects-table-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client Name</th>
                <th>Status</th>
                <th>Assigned Team</th>
                <th>Start Date</th>
                <th>Estimated Completion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {archivedProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.clientName}</td>
                  <td>{project.status}</td>
                  <td>{project.assignedTeamRoles.join(", ")}</td>
                  <td>{new Date(project.startDate).toLocaleDateString()}</td>
                  <td>{new Date(project.estimatedCompletion).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      className="action-btn unarchive"
                      onClick={() => handleUnarchiveProject(project.id)}
                    >
                      Unarchive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default ArchivedProjects;
