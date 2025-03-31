import { useEffect, useState } from "react";
import axios from "axios";
import { getCustomers, deleteCustomer } from "../../lib/api"; 
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye   } from "react-icons/fa";
import { MdDelete } from "react-icons/md"
import useRolePermissions from "../../hooks/useRolePermissions";
// import { FaEye } from "react-icons/fa";
import { url } from "../../lib/api";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";
const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(8);
    const [projectCounts, setProjectCounts] = useState({}); 
    const [loader , setLoading] = useState(true)
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
                if(customersData){
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
                console.error("Error fetching customers or projects:", error);
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
                customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
                customer.email.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredCustomers(filteredData);
        setCurrentPage(1);
    }, [search, statusFilter, customers]);

    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
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
                    {loader ? <Loader/>: <tbody>
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customer , index ) => (
                                <tr key={customer.id} className="border-b">
                                 <td>{(currentPage - 1) * customersPerPage + index + 1}</td> 
                                    <td className="border p-2">{customer.full_name}</td>
                                    <td className="border p-2">{projectCounts[customer.id] || 0}</td> {/* Project count */}
                                    <td className="border p-2">{customer.company_name}</td>
                                    <td className="border p-2">{customer.status}</td>

                                    {(canEdit || canDelete || canView) && (
                                        <td className="actions">
                                            {canEdit && (
                                                <FaEdit
                                                style={{
                                                    color : "black",
                                                    fontSize : "23px"
                                                }}
                                                    className="edit-icon"
                                                    title="Edit"
                                                    onClick={() => navigate(`/edit-customer/${customer.id}`)}
                                                />
                                            )}
                                            {canDelete && (
                                                <MdDelete
                                                style={{
                                                    color : "black",
                                                    fontSize : "25px"
                                                }}
                                                    className="delete-icon"
                                                    title="Delete"
                                                    onClick={() => handleDelete(customer.id)}
                                                />
                                            )}
                                            {canView && (
                                                <FaEye
                                                style={{
                                                    color : "black",
                                                    fontSize : "23px"
                                                }}
                                                    
                                                    title="View"
                                                    onClick={() => navigate(`/view-customer/${customer.id}`)}
                                                />
                                            )}
                                        </td>
                                    )}


                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>No customer found</td>
                            </tr>
                        )}
                    </tbody> }
                    
                </table>

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
        </Layout>
    );
};

export default Customer;
