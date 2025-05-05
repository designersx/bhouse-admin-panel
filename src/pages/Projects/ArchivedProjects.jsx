import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../styles/Projects/project.css';
import { url } from '../../lib/api';
import Loader from '../../components/Loader';
const ArchivedProjects = () => {
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedProjects = async () => {
      try {
        const res = await axios.get(`${url}/projects/archived`);
        const formatted = res.data.map(project => ({
          ...project,
          assignedTeam: Array.isArray(project.assignedTeamRoles)
            ? project.assignedTeamRoles.map(role => `${role.role}`).join(', ')
            : 'N/A',
          startDateFormatted: new Date(project.startDate).toLocaleDateString(),
          completionDateFormatted: project.estimatedCompletion
            ? new Date(project.estimatedCompletion).toLocaleDateString()
            : 'N/A'
        }));
        setArchivedProjects(formatted);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching archived projects", error);
      }
    };

    fetchArchivedProjects();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleUnarchive = async (projectId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to unarchive this project?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unarchive it!',
      cancelButtonText: 'Cancel'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axios.patch(`${url}/projects/${projectId}/unarchive`);
        if (res.status === 200) {
          Swal.fire('Unarchived!', 'The project has been restored.', 'success');
          setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
        }
      } catch (err) {
        Swal.fire('Error!', 'Unarchiving failed.', 'error');
      }
    }
  };

  const filteredProjects = archivedProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.clientName.toLowerCase().includes(searchQuery)
  );

  return (
    <Layout>
      <div className="projects-header">
        <h1>Archived Projects</h1>
        <input
          type="text"
          className="user-search-input"
          placeholder="Search by project or client..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

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
