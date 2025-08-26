import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAllUsers, url } from "../lib/api";
import "../../src/styles/CustomerProjects.css";
import { useNavigate } from "react-router-dom";

const safeParseJSON = (val) => {
  if (typeof val !== "string") return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

const normalizeIds = (val) => {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.map((x) => Number(x)).filter(Number.isFinite);
  }
  if (typeof val === "number") return [val];
  if (typeof val === "string") {
    const parsed = safeParseJSON(val);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => Number(x)).filter(Number.isFinite);
    }
    if (parsed != null) {
      const num = Number(parsed);
      return Number.isFinite(num) ? [num] : [];
    }
    return val
      .split(/[,\s]+/)
      .map((x) => Number(x))
      .filter(Number.isFinite);
  }
  return [];
};
const normalizeArrayMaybeJSON = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const parsed = safeParseJSON(val);
    return Array.isArray(parsed) ? parsed : [];
  }
  return [];
};
const prettyNames = (val) => {
  const parsed = safeParseJSON(val);
  if (Array.isArray(parsed)) return parsed.join(", ");
  return String(val ?? "");
};

function CustomerProjects({ customerId, customerName }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [projectRes, userRes] = await Promise.all([
          axios.get(`${url}/projects`),
          getAllUsers(),
        ]);
        const wantedIdsSet = new Set(
          normalizeIds(customerId).map((id) => String(id))
        );
        const allProjects = Array.isArray(projectRes?.data) ? projectRes.data : [];
        const filteredProjects = allProjects.filter((project) => {
          const clientIds = normalizeIds(project?.clientId).map((id) => String(id));
          return clientIds.some((id) => wantedIdsSet.has(id));
        });

        setUsers(Array.isArray(userRes) ? userRes : []);
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [customerId]);

  const getUserFullName = (userId) => {
    const user = users.find((u) => Number(u.id) === Number(userId));
    return user ? `${user.firstName} ${user.lastName}` : null;
  };
  const displayCustomerName = prettyNames(customerName);

  return (
    <div className="projects-container">
      <h2 className="title">Projects for {displayCustomerName}</h2>

      {projects.length > 0 ? (
        <div className="project-grid">
          {projects.map((project) => {
            const assignedRoles = normalizeArrayMaybeJSON(project.assignedTeamRoles);
            return (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/project-details/${project.id}`)}
                style={{ cursor: "pointer" }}
              >
                <h3 className="project-title">{project.name}</h3>
                {project.clientName && (
                  <p className="project-info">
                    <strong>Client:</strong> {prettyNames(project.clientName)}
                  </p>
                )}

                <p className="project-info">
                  <strong>Type:</strong> {project.type}
                </p>
                <p className="project-info">
                  <strong>Description:</strong> {project.description}
                </p>
                <p className="project-info">
                  <strong>Estimated Completion:</strong> {project.estimatedCompletion}
                </p>
                <p className="project-info">
                  <strong>Total Value:</strong> ${project.totalValue}
                </p>
                <p className="project-info">
                  <strong>Delivery Address:</strong> {project.deliveryAddress}
                </p>

                <p
                  className={`project-status ${String(project.status || "unknown")
                    .toLowerCase()
                    .replace(/\s/g, "")}`}
                >
                  {project.status || "Unknown"}
                </p>

                <div className="assigned-roles">
                  <strong>Assigned Roles:</strong>
                  {assignedRoles.map((role, index) => {
                    const validUsers = normalizeIds(role?.users)
                      .map((id) => getUserFullName(id))
                      .filter(Boolean);

                    if (validUsers.length === 0) return null;
                    return (
                      <div key={index} className="role-container">
                        <span className="role-title">{role.role}:</span>
                        {validUsers.map((userName, idx) => (
                          <span key={idx} className="user-name">
                            {userName}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-projects">No projects found for these customers.</p>
      )}
    </div>
  );
}

export default CustomerProjects;
