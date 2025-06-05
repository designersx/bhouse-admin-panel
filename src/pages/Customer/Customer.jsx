import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getCustomers, deleteCustomer, addCustomerComment, getCustomerComments } from "../../lib/api";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md"
import useRolePermissions from "../../hooks/useRolePermissions";
import { FaCommentAlt } from "react-icons/fa";
import { url, url2 } from "../../lib/api";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

import Offcanvas from "../../components/OffCanvas/OffCanvas";
import { FaTelegramPlane } from 'react-icons/fa';

const Customer = () => {
  const commentsEndRef = useRef(null)
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(8);
  const [customerId, setCustomerId] = useState()
  const [projectCounts, setProjectCounts] = useState({});


  const [loader, setLoading] = useState(true)
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
        // Fetch Customers
        const customersData = await getCustomers();
        if (customersData) {
          setLoading(false)

        }
        setCustomers(customersData);
        setFilteredCustomers(customersData);

        // Fetch Projects
        const projectRes = await axios.get(`${url}/projects`);
        const projects = projectRes.data;

        // Count projects for each customer
        const counts = {};
        customersData.forEach(customer => {
          counts[customer.id] = projects.filter(project => project.clientId === customer.id).length;
        });

        setProjectCounts(counts);
      } catch (error) {
        console.log("Error fetching customers or projects:", error);
      }
    };

    fetchCustomersAndProjects();
  }, []);

  useEffect(() => {
    let filteredData = customers;
    if (statusFilter !== "all") {
      filteredData = filteredData.filter(customer => customer.status === statusFilter);
    }
    if (search) {
      filteredData = filteredData.filter(customer =>
        customer.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredCustomers(filteredData);
    setCurrentPage(1);
  }, [search, statusFilter, customers]);

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers?.slice(indexOfFirstCustomer, indexOfLastCustomer);
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
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await deleteCustomer(id);
        setCustomers(customers.filter(customer => customer.id !== id));
        Swal.fire("Deleted!", "The customer has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting customer", error);
        Swal.fire("Error!", "Failed to delete customer.", "error");
      }
    }
  };

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const openOffcanvas = () => {
    fetchComments()
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
      // Sort comments by createdAt in descending order (latest first)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(data); // Store sorted comments in state
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Prevent empty comments
    let data = JSON.parse(localStorage.getItem("user"))
    let userId = data?.user?.id
    let userRole = data?.user?.userRole
    const commentData = {
      comment: newComment,
      userId,
      userRole,
    };

    try {
      await addCustomerComment(customerId, commentData);
      setNewComment(""); // Clear input
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Group comments by date (show actual date, not "Today")
  const groupCommentsByDate = () => {
    const grouped = {};
    comments.forEach((comment) => {
      const commentDate = new Date(comment.createdAt);
      const today = new Date();

      // Format the date to a readable string (e.g., "Apr 1, 2025")
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
  console.log({ projectCounts })
  return (
    <Layout>
      <div className="roles-container">
        <h2 className="table-header">Customers</h2>

        <div className="roles-header">
          {canCreate && (
            <button className="add-role-btn" onClick={() => navigate("/add-customer")}>
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
        {loader ? <Loader /> :
        <div className="rolesTableM">
          <table className="roles-table">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Sr. No</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Projects</th>
                <th className="border p-2">Company</th>
                <th className="border p-2">Status</th>
                {(canEdit || canDelete || canView) && <th className="border p-2">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b">
                    <td>{(currentPage - 1) * customersPerPage + index + 1}</td>
                    <td className="border p-2">{customer.full_name}</td>
                    <td className="border p-2">{projectCounts[customer.id] || 0}</td> {/* Project count */}
                    <td className="border p-2">{customer.company_name}</td>
                    <td className="border p-2">{customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}</td>

                    {(canEdit || canDelete || canView) && (
                      <td className="actions">
                        {canEdit && (
                          <FaEdit
                            style={{
                              color: "#004680",
                              fontSize: "23px"
                            }}
                            className="edit-icon"
                            title="Edit"
                            onClick={() => navigate(`/edit-customer/${customer.id}`)}
                          />
                        )}
                        {canDelete && (
                          <MdDelete
                            style={{
                              color: "#004680",
                              fontSize: "25px"
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
                              fontSize: "23px"
                            }}

                            title="View"
                            onClick={() => navigate(`/view-customer/${customer.id}`)}
                          />
                        )}
                        {/* {rolePermissions?.CustomerComments?.view ?
                          <FaCommentAlt style={{
                            color: "#004680",
                            fontSize: "19px"
                          }}
                            title="Comments"

                            onClick={() => {
                              openOffcanvas();
                              setCustomerId(customer.id);
                            }

                            } />
                          : null} */}

                      </td>
                    )}


                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No customer found</td>
                </tr>
              )}
            </tbody>

          </table>
          </div>
        }

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
                className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
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

      <Offcanvas isOpen={isOffcanvasOpen} closeOffcanvas={closeOffcanvas} getLatestComment={fetchComments}>
        <div className="right-panel">
          <div
            className="comments-list"
            style={{ overflowY: "auto", maxHeight: "500px", display: "flex", flexDirection: "column" }}
          >
            {/* Display grouped comments by date */}
            {Object.keys(groupedComments).map((date) => (
              <div key={date} className="comment-date-group">
                <p>{date}</p> {/* Display actual date */}
                {groupedComments[date].reverse().map((comment) => ( // Reverse to show latest at bottom
                  <div key={comment.id}>
                    <div className="whatsapp-comment-box">
                      <div className="whatsapp-comment-user-info">
                        <img
                          src={`${url2}/${comment?.users?.profileImage}` || `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
                          alt="User"
                          className="whatsapp-comment-user-avatar"
                        />
                        <div>
                          <p className="whatsapp-comment-author">
                            {comment?.users?.firstName}
                            <span className="comment-user-role"> ({comment?.users?.userRole})</span>
                          </p>
                        </div>
                      </div>
                      <p className="whatsapp-comment-text">{comment.comment}</p>
                      <p className="whatsapp-comment-meta">
                        {new Date(comment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* Empty div to scroll to latest comment */}
            <div ref={commentsEndRef}></div>
          </div>
        </div>
        {rolePermissions?.CustomerComments?.add ?
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
          : null}



      </Offcanvas>



    </Layout>
  );
};

export default Customer;
