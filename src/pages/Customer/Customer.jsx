import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  getCustomers,
  deleteCustomer,
  addCustomerComment,
  getCustomerComments,
} from "../../lib/api";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import useRolePermissions from "../../hooks/useRolePermissions";
import { FaCommentAlt } from "react-icons/fa";
import { url, url2 } from "../../lib/api";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

import Offcanvas from "../../components/OffCanvas/OffCanvas";
import { FaTelegramPlane } from "react-icons/fa";

/** ---------------- Helpers for robust ID parsing ---------------- **/
const safeParseJSON = (val) => {
  if (typeof val !== "string") return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

/**
 * Normalize incoming ids into an array of numbers.
 * Accepts: number | string-number | number[] | stringified array | "1,2" | "1 2"
 */
const normalizeIds = (val) => {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map((x) => Number(x)).filter(Number.isFinite);
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
/** ---------------------------------------------------------------- **/

const Customer = () => {
  const commentsEndRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(8);
  const [customerId, setCustomerId] = useState();
  const [projectCounts, setProjectCounts] = useState({});

  const [loader, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const roleId = user?.user?.roleId;
  const { rolePermissions } = useRolePermissions(roleId);

  const canCreate = rolePermissions?.Customer?.create;
  const canEdit = rolePermissions?.Customer?.edit;
  const canDelete = rolePermissions?.Customer?.delete;
  const canView = rolePermissions?.Customer?.view;

  useEffect(() => {
    const fetchCustomersAndProjects = async () => {
      try {
        // Fetch both in parallel
        const [customersData, projectRes] = await Promise.all([
          getCustomers(),
          axios.get(`${url}/projects`),
        ]);

        const projects = Array.isArray(projectRes?.data) ? projectRes.data : [];

        // Build counts by iterating each project and incrementing for ALL clientIds it contains
        const counts = {};
        for (const project of projects) {
          // Normalize a project's clientId to an array of numbers and de-duplicate
          const ids = Array.from(new Set(normalizeIds(project?.clientId)));
          for (const id of ids) {
            counts[id] = (counts[id] || 0) + 1;
          }
        }

        setCustomers(customersData || []);
        setFilteredCustomers(customersData || []);
        setProjectCounts(counts);
      } catch (error) {
        console.log("Error fetching customers or projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersAndProjects();
  }, []);

  useEffect(() => {
    let filteredData = customers;
    if (statusFilter !== "all") {
      filteredData = filteredData.filter(
        (customer) => customer.status === statusFilter
      );
    }
    if (search) {
      filteredData = filteredData.filter((customer) =>
        customer.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredCustomers(filteredData);
    setCurrentPage(1);
  }, [search, statusFilter, customers]);

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers?.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // 🗑️ Delete Customer
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteCustomer(id);
        setCustomers(customers.filter((customer) => customer.id !== id));
        Swal.fire("Deleted!", "The customer has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting customer", error);
        Swal.fire("Error!", "Failed to delete customer.", "error");
      }
    }
  };

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const openOffcanvas = () => {
    fetchComments();
    setIsOffcanvasOpen(true);
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  useEffect(() => {
    if (customerId) {
      fetchComments();
    }
  }, [customerId]);

  const fetchComments = async () => {
    try {
      const data = await getCustomerComments(customerId);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    let data = JSON.parse(localStorage.getItem("user"));
    let userId = data?.user?.id;
    let userRole = data?.user?.userRole;
    const commentData = {
      comment: newComment,
      userId,
      userRole,
    };

    try {
      await addCustomerComment(customerId, commentData);
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Group comments by date (show actual date)
  const groupCommentsByDate = () => {
    const grouped = {};
    comments.forEach((comment) => {
      const commentDate = new Date(comment.createdAt);
      const dateKey = commentDate.toLocaleDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(comment);
    });

    return grouped;
  };

  const groupedComments = groupCommentsByDate();
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedComments]);

  return (
    <Layout>
      <div className="roles-container">
        <h2 className="table-header">Customers</h2>

        <div className="roles-header">
          {canCreate && (
            <button
              className="add-role-btn"
              onClick={() => navigate("/add-customer")}
            >
              + Add
            </button>
          )}

          <div className="customer-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* 📌 Customers Table */}
        {loader ? (
          <Loader />
        ) : (
          <div className="rolesTableM">
            <table className="roles-table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Sr. No</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Projects</th>
                  <th className="border p-2">Company</th>
                  <th className="border p-2">Status</th>
                  {(canEdit || canDelete || canView) && (
                    <th className="border p-2">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {currentCustomers.length > 0 ? (
                  currentCustomers.map((customer, index) => (
                    <tr key={customer.id} className="border-b">
                      <td>
                        {(currentPage - 1) * customersPerPage + index + 1}
                      </td>
                      <td className="border p-2">{customer.full_name}</td>
                      {/* ✅ Count projects where this customer's id appears in the project's clientId list */}
                      <td className="border p-2">
                        {projectCounts[customer.id] || 0}
                      </td>
                      <td className="border p-2">{customer.company_name}</td>
                      <td className="border p-2">
                        {customer.status.charAt(0).toUpperCase() +
                          customer.status.slice(1)}
                      </td>

                      {(canEdit || canDelete || canView) && (
                        <td className="actions">
                          {canEdit && (
                            <FaEdit
                              style={{
                                color: "#004680",
                                fontSize: "23px",
                              }}
                              className="edit-icon"
                              title="Edit"
                              onClick={() =>
                                navigate(`/edit-customer/${customer.id}`)
                              }
                            />
                          )}
                          {canDelete && (
                            <MdDelete
                              style={{
                                color: "#004680",
                                fontSize: "25px",
                              }}
                              className="delete-icon"
                              title="Delete"
                              onClick={() => handleDelete(customer.id)}
                            />
                          )}
                          {canView && (
                            <FaEye
                              style={{
                                color: "#004680",
                                fontSize: "23px",
                              }}
                              title="View"
                              onClick={() =>
                                navigate(`/view-customer/${customer.id}`)
                              }
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No customer found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 🔄 Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="icon-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`page-btn ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="icon-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* comments offcanvas */}
      <Offcanvas
        isOpen={isOffcanvasOpen}
        closeOffcanvas={closeOffcanvas}
        getLatestComment={fetchComments}
      >
        <div className="right-panel">
          <div
            className="comments-list"
            style={{
              overflowY: "auto",
              maxHeight: "500px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {Object.keys(groupedComments).map((date) => (
              <div key={date} className="comment-date-group">
                <p>{date}</p>
                {groupedComments[date]
                  .reverse()
                  .map((comment) => (
                    <div key={comment.id}>
                      <div className="whatsapp-comment-box">
                        <div className="whatsapp-comment-user-info">
                          <img
                            src={
                              comment?.users?.profileImage
                                ? `${url2}/${comment?.users?.profileImage}`
                                : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
                            }
                            alt="User"
                            className="whatsapp-comment-user-avatar"
                          />
                          <div>
                            <p className="whatsapp-comment-author">
                              {comment?.users?.firstName}
                              <span className="comment-user-role">
                                {" "}
                                ({comment?.users?.userRole})
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="whatsapp-comment-text">
                          {comment.comment}
                        </p>
                        <p className="whatsapp-comment-meta">
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
            <div ref={commentsEndRef}></div>
          </div>
        </div>
        {rolePermissions?.CustomerComments?.add ? (
          <div className="whatsapp-comment-form">
            <textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="whatsapp-comment-input"
            />
            <button onClick={handleAddComment} className="whatsapp-submit-btn">
              <FaTelegramPlane />
            </button>
          </div>
        ) : null}
      </Offcanvas>
    </Layout>
  );
};

export default Customer;
