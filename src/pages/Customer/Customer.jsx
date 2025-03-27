import { useEffect, useState } from "react";
import axios from "axios";
import { getCustomers, deleteCustomer } from "../../lib/api"; 
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(5);
    const [projectCounts, setProjectCounts] = useState({}); 

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomersAndProjects = async () => {
            try {
                // Fetch Customers
                const customersData = await getCustomers();
                setCustomers(customersData);
                setFilteredCustomers(customersData);

                // Fetch Projects
                const projectRes = await axios.get("http://localhost:5000/api/projects");
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
        if (window.confirm("Are you sure you want to delete this customer?")) {
            try {
                await deleteCustomer(id);
                setCustomers(customers.filter(customer => customer.id !== id));
            } catch (error) {
                console.error("Error deleting customer", error);
            }
        }
    };

    return (
        <Layout>
            <div className="roles-container">
                <h2>Customers</h2>
                
                <div className="roles-header">
                    <button className="add-role-btn" onClick={() => navigate("/add-customer")}>
                        + Add 
                    </button>
                    <div>
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
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Projects</th>
                            <th className="border p-2">Company</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customer) => (
                                <tr key={customer.id} className="border-b">
                                    <td className="border p-2">{customer.full_name}</td>
                                    <td className="border p-2">{projectCounts[customer.id] || 0}</td> {/* Project count */}
                                    <td className="border p-2">{customer.company_name}</td>
                                    <td className="border p-2">{customer.status}</td>
                                    <td className="actions">
                                        <FaEdit 
                                            className="edit-icon" 
                                            title="Edit" 
                                            onClick={() => navigate(`/edit-customer/${customer.id}`)} 
                                        />
                                        <FaTrash 
                                            className="delete-icon" 
                                            title="Delete"  
                                            onClick={() => handleDelete(customer.id)}
                                        />
                                        <FaEye 
                                            className="view-icon"
                                            title="View"
                                            onClick={() => navigate(`/view-customer/${customer.id}`)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-4">No customers found.</td>
                            </tr>
                        )}
                    </tbody>
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
