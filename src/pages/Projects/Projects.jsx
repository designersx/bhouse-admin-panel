import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import '../../styles/Projects/project.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useRolePermissions from '../../hooks/useRolePermissions';
import { MdDelete } from "react-icons/md"
import { url } from '../../lib/api';
import Loader from '../../components/Loader'
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const localData = JSON.parse(localStorage.getItem('user'));
  const userRole = localData?.user?.userRole;
  const roleId = localData?.user?.roleId;
  const { rolePermissions } = useRolePermissions(roleId);
  const canCreate = rolePermissions?.ProjectManagement?.create;
  const canEdit = rolePermissions?.ProjectManagement?.edit;
  const canDelete = rolePermissions?.ProjectManagement?.delete;
  const canView = rolePermissions?.ProjectManagement?.view;


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${url}/auth/getAllUsers`);
        setAllUsers(res.data);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, []);
  const getAssignedUserNames = (assignedTeamRoles) => {
    if (!Array.isArray(assignedTeamRoles)) return "";

    const userMap = {};
    if(allUsers){
      allUsers?.forEach(user => {
        userMap[user.id] = `${user.firstName} ${user.lastName}`;
      });
    }
   

    return assignedTeamRoles
      .flatMap(roleEntry =>
        Array.isArray(roleEntry.users)
          ? roleEntry.users.map(userId => userMap[userId] || `User ID: ${userId}`)
          : []
      )
      .join(", ");
  };
console.log(getAssignedUserNames())

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${url}/projects`);
        const allProjects = response.data;

        const localData = JSON.parse(localStorage.getItem('user'));
        const userData = localData?.user;

        if (!userData) {
          console.log("No user data found in localStorage");
          setProjects([]);
          setFilteredProjects([]);
          setLoading(false);
          return;
        }

        const userId = userData.id;
        const userRole = userData.userRole;

        let visibleProjects = [];

        if (userRole === "Super Admin") {
          visibleProjects = allProjects;
        } else {
          visibleProjects = allProjects.filter(project => {
            const assigned = project.assignedTeamRoles?.some(role => {
              return Array.isArray(role.users) && role.users.includes(userId);
            });
            if (assigned) {
            }
            return assigned;
          });
        }

        setProjects(visibleProjects);
        setFilteredProjects(visibleProjects);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching projects", error);
        setLoading(false);

      }
    };

    fetchProjects();
  }, []);


  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
        project.clientName.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  const navigate = useNavigate();
  const handleViewProject = (projectId) => {
    navigate(`/project-details/${projectId}`);
  };
  const handleNewProjectClick = () => {
    navigate('/add-projects');
  };
  const handleArchivedProjectClick = () => {
    navigate('/archived-projects');
  };
  const handleEditProject = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };
  // Function to handle archiving a project
  const handleArchiveProject = async (projectId) => {
    // Show SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to archive this project.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive it!'
    });

    if (result.isConfirmed) {
      try {
        // Call the API to archive the project
        const response = await axios.patch(`${url}/projects/${projectId}/archive`);
        if (response.status === 200) {
          Swal.fire(
            'Archived!',
            'The project has been archived.',
            'success'
          );
          // Update the state to reflect the archived status
          setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
          setFilteredProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
        }
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an issue archiving the project.',
          'error'
        );
      }
    }
  };

  return (
    <Layout>
      <div className="projects-page">
        <div className='project-first-header'>
        <h2 className='table-header'>Projects</h2>
        {canCreate && (
          <button className="add-user-btn" onClick={handleArchivedProjectClick}>
            Archived Projects
          </button>
        )}
        </div>
      
      

      
      <div className="header-actions">
        {canCreate && (
          <button className="add-user-btn" onClick={handleNewProjectClick}>
           Add Project
          </button>
        )}

        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>

      <div className="roles-table">
        {loading ? (
            <Loader/>
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
                {(canEdit || canDelete || canView) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length ? <>
                { filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.clientName}</td>
                  <td>{project.status}</td>
                  <td>{getAssignedUserNames(project.assignedTeamRoles)}</td>
                  <td>{new Date(project.startDate).toLocaleDateString()}</td>
                  <td>{new Date(project.estimatedCompletion).toLocaleDateString()}</td>
                  <td className="actions">
                    {canEdit && (
                      <button className="action-btn edit" onClick={() => handleEditProject(project.id)}>
                        <i className="fas fa-edit"></i>
                      </button>
                    )}

                    {canView && (
                      <button className="action-btn view" onClick={() => handleViewProject(project.id)}>
                        <i className="fas fa-eye"></i>
                      </button>
                    )}

                    {canDelete && (
                      <button onClick={() => handleArchiveProject(project.id)}>
                      <i className='fa fa-trash'></i>
                     </button>
                    )}
                  </td>

                </tr>
              ))}
              </> :  <td colSpan="7" style={{ textAlign: "center" }}>No Project found</td> }
              
            </tbody>
          </table>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Projects;
