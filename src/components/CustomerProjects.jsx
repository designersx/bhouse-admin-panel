import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAllUsers } from "../lib/api";
import { url } from "../lib/api";
import '../../src/styles/CustomerProjects.css'
function CustomerProjects({ customerId, customerName }) {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectRes = await axios.get(`${url}/projects`);
                const userRes = await getAllUsers();

                const filteredProjects = projectRes.data.filter(
                    project => Number(project?.clientId) === Number(customerId)
                );

                setUsers(userRes);
                setProjects(filteredProjects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, [customerId]);

    const getUserFullName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : null;
    };

    return (
        <div className="projects-container">
            <h2 className="title">Projects for {customerName}</h2>

            {projects.length > 0 ? (
                <div className="project-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <h3 className="project-title">{project.name}</h3>
                            <p className="project-info"><strong>Type:</strong> {project.type}</p>
                            <p className="project-info"><strong>Description:</strong> {project.description}</p>
                            <p className="project-info">
  <strong>Estimated Completion:</strong>{" "}
  {new Date(project.estimatedCompletion).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })}
</p>

                            <p className="project-info"><strong>Total Value:</strong> ${project.totalValue}</p>
                            <p className="project-info"><strong>Delivery Address:</strong> {project.deliveryAddress}</p>

                            {/* Status Badge */}
                            <p className={`project-status ${project.status.toLowerCase().replace(/\s/g, '')}`}>
                                {project.status}
                            </p>

                            {/* Assigned Roles */}
                            <div className="assigned-roles">
                                <strong>Assigned Roles:</strong>
                                {project.assignedTeamRoles.map((role, index) => {
                                    const validUsers = role.users.map(userId => getUserFullName(userId)).filter(Boolean);
                                    if (validUsers.length === 0) return null;
                                    return (
                                        <div key={index} className="role-container">
                                            <span className="role-title">{role.role}:</span>
                                            {validUsers.map((userName, idx) => (
                                                <span key={idx} className="user-name">{userName}</span>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-projects">No projects found for this customer.</p>
            )}
        </div>
    );
}

export default CustomerProjects;
