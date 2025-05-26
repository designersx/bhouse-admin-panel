import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Projects/AddProject.css";
import { url, getCustomers } from "../../lib/api";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { url2 } from "../../lib/api";
import SpinnerLoader from "../../components/SpinnerLoader";
const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [allRoles, setAllRoles] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "Corporate Office",
    clientName: "",
    description: "",
    clientId: "",
    advancePayment: "",
    estimatedCompletion: "",
    totalValue: "",
    deliveryAddress: "",
    deliveryHours: "",
    assignedTeamRoles: {},
    proposals: [],
    floorPlans: [],
    otherDocuments: [],
    presentation: [],
    cad: [],
    salesAggrement: [],
    acknowledgements: [],
    finalInvoice : [] ,

    receivingReports: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leadTimeMatrix, setLeadTimeMatrix] = useState([]);
  const [files, setFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leadTimeItems, setLeadTimeItems] = useState([]);
  const predefinedOptions = ["Regular Hours", "Before 9 AM", "After 6 PM"];
  const [deliveryHourOption, setDeliveryHourOption] = useState("Regular Hours");
  const [customDeliveryHour, setCustomDeliveryHour] = useState("");
  const [initialFinance, setInitialFinance] = useState({
    advancePayment: "",
    totalValue: "",
  });
  const [notifyClient, setNotifyClient] = useState(false);

  // Prefill when formData loads from DB
  useEffect(() => {
    const existing = formData.deliveryHours;
    if (predefinedOptions.includes(existing)) {
      setDeliveryHourOption(existing);
      setCustomDeliveryHour("");
    } else {
      setDeliveryHourOption("Other");
      setCustomDeliveryHour(existing || "");
    }
  }, [formData.deliveryHours]);

  const fetchLeadTimeItems = async (projectId) => {
    try {
      const res = await axios.get(`${url}/items/${projectId}`);
      setLeadTimeItems(
        (res.data || []).map((item) => ({
          ...item,
          tbd: typeof item.tbd === "boolean" ? item.tbd : false,
        }))
      );
      
    } catch (error) {
      console.error("Error fetching lead time items:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchProjectDetails();
    fetchCustomers();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get(`${url}/roles`);
    const allowedLevels = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const filtered = res.data?.data.filter((role) =>
      allowedLevels.includes(role.defaultPermissionLevel)
    );
    const roleTitles = filtered.map((role) => role.title);
    setAllRoles(roleTitles);
  };

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`${url}/projects/${projectId}`);
      const project = res.data;

      const parsedRoles =
        typeof project.assignedTeamRoles === "string"
          ? JSON.parse(project.assignedTeamRoles)
          : project.assignedTeamRoles;

      const roleMap = {};
      const selected = [];

      for (const { role, users } of parsedRoles) {
        roleMap[role] = users;
        selected.push(role);
        fetchUsers(role);
      }

      setSelectedRoles(selected);

      const formatDate = (dateString) =>
        dateString ? new Date(dateString).toISOString().slice(0, 10) : "";

      // 🟡 Set initial financial values
      setInitialFinance({
        advancePayment: project.advancePayment,
        totalValue: project.totalValue,
      });

      // 🟡 Set formData
      setFormData({
        ...project,
        assignedTeamRoles: roleMap,
        startDate: formatDate(project.startDate),

        estimatedCompletion: project.estimatedCompletion,

        proposals: JSON.parse(project.proposals || "[]"),
        floorPlans: JSON.parse(project.floorPlans || "[]"),
        otherDocuments: JSON.parse(project.otherDocuments || "[]"),
        presentation: JSON.parse(project.presentation || "[]"),
        cad: JSON.parse(project.cad || "[]"),
        salesAggrement: JSON.parse(project.salesAggrement || "[]"),
        receivingReports: JSON.parse(project.receivingReports || "[]"),
        acknowledgements: JSON.parse(project.acknowledgements || "[]"),
        finalInvoice: JSON.parse(project.finalInvoice || "[]"),

      });

      // 🟡 Lead Time Matrix
      setLeadTimeMatrix(
        typeof project.leadTimeMatrix === "string"
          ? JSON.parse(project.leadTimeMatrix || "[]")
          : project.leadTimeMatrix || []
      );

      await fetchLeadTimeItems(projectId);

      // 🟡 Reset checkbox initially
      setNotifyClient(false);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleAddItemRow = () => {
    setLeadTimeItems((prev) => [
      ...prev,
      {
        itemName: "",
        quantity: "",
        expectedDeliveryDate: "",
        expectedArrivalDate: "",
        status: "Pending",
        projectId,
        arrivalDate : null
      },
    ]);
  };

  const addNewItemToBackend = async (item, index) => {
    try {
      const res = await axios.post(`${url}/items/project-items`, {
        ...item,
        projectId,
      });

      const updated = [...leadTimeItems];
      updated[index] = res.data;
      setLeadTimeItems(updated);
      Swal.fire("Manufacturer added!");
    } catch (err) {
      alert("Failed to add item.");
      console.error(err);
    }
  };

  const fetchUsers = async (role) => {
    try {
      const res = await axios.get(
        `${url}/auth/users-by-role/${encodeURIComponent(role)}`
      );
      const users = res.data?.users || [];
      setUsersByRole((prev) => ({ ...prev, [role]: users }));
    } catch (err) {
      console.error(`Failed to fetch users for role: ${role}`, err);
    }
  };
  const handleItemChange = (index, field, value) => {
    const updated = [...leadTimeItems];

    if (field === "tbd") {
      updated[index][field] = value;

      if (value) {
        // If TBD is checked, clear the date fields
        updated[index].expectedDeliveryDate = "";
        updated[index].expectedArrivalDate = "";
        updated[index].arrivalDate = "";
      }
    } else {
      updated[index][field] = value;
    }

    setLeadTimeItems(updated);
  };

  const updateItem = async (item) => {
    try {
      await axios.put(`${url}/items/project-items/${item.id}`, item);
      Swal.fire("Manufacturer updated!");
    } catch (err) {
      Swal.fire("Error updating item.");
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${url}/items/project-items/${id}`);
      setLeadTimeItems((prev) => prev.filter((item) => item.id !== id));
      Swal.fire("Manufacturer deleted!");
    } catch (err) {
      alert("Error deleting item.");
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      const activeCustomers = (data || []).filter(
        (customer) => customer.status === "active"
      );
      setCustomers(activeCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const toggleRole = async (role) => {
    if (selectedRoles.includes(role)) {
      // Deselect role
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
      setUsersByRole((prev) => {
        const updated = { ...prev };
        delete updated[role];
        return updated;
      });
      setFormData((prev) => {
        const updated = { ...prev.assignedTeamRoles };
        delete updated[role];
        return { ...prev, assignedTeamRoles: updated };
      });
    } else {
      try {
        const res = await axios.get(
          `${url}/auth/users-by-role/${encodeURIComponent(role)}`
        );
        const users = res.data?.users || [];

        if (users.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "No Users Found",
            text: `There are no users available for the role "${role}".`,
          });
          return; // Stop here, don't assign role
        }

        // Add role
        setSelectedRoles((prev) => [...prev, role]);
        setUsersByRole((prev) => ({ ...prev, [role]: users }));
        setFormData((prev) => ({
          ...prev,
          assignedTeamRoles: {
            ...prev.assignedTeamRoles,
            [role]: [],
          },
        }));
      } catch (err) {
        console.error(`Failed to fetch users for role: ${role}`, err);
        Swal.fire({
          icon: "error",
          title: "Fetch Error",
          text: `Unable to get users for role "${role}"`,
        });
      }
    }
  };

  const handleUserCheckbox = (role, userId, checked) => {
    const prevSelected = formData.assignedTeamRoles[role] || [];
    const updatedUsers = checked
      ? [...prevSelected, userId]
      : prevSelected.filter((id) => id !== userId);

    setFormData((prev) => ({
      ...prev,
      assignedTeamRoles: {
        ...prev.assignedTeamRoles,
        [role]: updatedUsers,
      },
    }));
  };

  const handleFileChange = (category, e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setFiles((prev) => ({
      ...prev,
      [category]: [file], 
    }));
  
    setFormData((prev) => ({
      ...prev,
      [category]: [],
    }));
  };
  
  const handleRemoveExistingFile = (category, url) => {
    setRemovedFiles((prev) => [...prev, url]);
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].filter((f) => f !== url),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    const shouldEnableCheckbox =
      parseFloat(formData.advancePayment) !==
        parseFloat(initialFinance.advancePayment) ||
      parseFloat(formData.totalValue) !== parseFloat(initialFinance.totalValue);

    // Only enable/disable the checkbox — do not set it to true
    const checkbox = document.getElementById("notifyClientCheckbox");
    if (checkbox) checkbox.disabled = !shouldEnableCheckbox;

    // Optional: reset checkbox if disabled
    if (!shouldEnableCheckbox) setNotifyClient(false);
  }, [formData.advancePayment, formData.totalValue, initialFinance]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateStep();
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: error,
      });
      return;
    }

    const formDataToSend = new FormData();

    const transformedRoles = Object.entries(formData.assignedTeamRoles).map(
      ([role, users]) => ({
        role,
        users,
      })
    );
    if (
      selectedRoles.includes("Account Manager") &&
      (!formData.assignedTeamRoles["Account Manager"] ||
        formData.assignedTeamRoles["Account Manager"].length === 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Account Manager",
        text: "You must assign at least one user under the 'Account Manager' role.",
      });
      return;
    }

    Object.entries(formData).forEach(([key, val]) => {
      if (key.includes("Date") || key.includes("At")) {
        const isValidDate = val && !isNaN(new Date(val).getTime());
        if (!isValidDate) return;
      }

      if (
        ![
          "assignedTeamRoles",
          "proposals",
          "floorPlans",
          "otherDocuments",
          "acknowledgements",
          "receivingReports",
          "finalInvoice"
        ].includes(key)
      ) {
        formDataToSend.append(
          key,
          Array.isArray(val) ? JSON.stringify(val) : val
        );
      }
    });

    formDataToSend.append(
      "assignedTeamRoles",
      JSON.stringify(transformedRoles)
    );
    formDataToSend.append("removedFiles", JSON.stringify(removedFiles));

    if (notifyClient) {
      await fetch(`${url}/projects/send-financial-update-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          newAdvance: formData.advancePayment,
          newTotal: formData.totalValue,
        }),
      });
    }

    Object.entries(files).forEach(([category, fileArray]) => {
      fileArray.forEach((file) => formDataToSend.append(category, file));
    });

    try {
      setIsLoading(true);
      const res = await fetch(`${url}/projects/${projectId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (res.status === 200) {
        Swal.fire("Project updated successfully!");
        navigate(`/project-details/${projectId}`);
      } else {
        const data = await res.json();
        Swal.fire('Something went wrong please try again later!');
      }
    } catch (err) {
      setIsLoading(false);
      Swal.fire("Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = () => {
    const { name, type, clientName, totalValue, advancePayment } = formData;

    if (step === 1) {
      if (!name.trim()) return "Project Name is required.";
      if (!type) return "Project Type is required.";
      if (!clientName) return "Customer selection is required.";
      if (!totalValue || isNaN(totalValue) || totalValue <= 0)
        return "Total Value must be a valid positive number.";
      if (
        advancePayment !== undefined &&
        advancePayment !== null &&
        advancePayment !== "" &&
        advancePayment <= -1
      ) {
        return "Advance Payment must be a positive number.";
      }
    }

    if (step === 2) {
      if (!selectedRoles.length) return "At least one role must be assigned.";
    }

    return null;
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      toast.error(`Error ${error}`);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <Layout>
      <ToastContainer />
      <div className="add-project-container">
        <h2>Edit Project</h2>
        <div className="step-indicator">
          <span className={step === 1 ? "active" : ""}>Step 1</span>
          <span className={step === 2 ? "active" : ""}>Step 2</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={`form-step step-${step}`}>
            {step === 1 && (
              <div className="form-card">
                <h3>Project Details</h3>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>
                      Project Name <span className="required-star">*</span>{" "}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Project Type <span className="required-star">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Corporate Office">Corporate Office</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Multi-family">Multi-family</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>
                      Select Customer <span className="required-star">*</span>
                    </label>
                    <select
                      name="clientId"
                      value={String(formData.clientId)}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value); // fix type
                        const selectedCustomer = customers.find(
                          (c) => c.id === selectedId
                        );
                        setFormData((prev) => ({
                          ...prev,
                          clientId: selectedCustomer?.id || "",
                          clientName: selectedCustomer?.full_name || "",
                          deliveryAddress:
                            selectedCustomer?.delivery_address || "",
                        }));
                      }}
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.full_name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>
                      Status <span className="required-star">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="In progress">In progress</option>
                      <option value="Aproved">Approved</option>
                      <option value="Waiting on Advance">
                        Waiting on Advance
                      </option>
                      <option value="Advance Paid">Advance Paid</option>
                      <option value="Order Processed">Order Processed</option>
                      <option value="Arrived">Arrived</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Installed">Installed</option>
                      <option value="Punch">Punch</option>
                      <option value="Completed">Balance Owed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Estimated Occupancy Date{" "}
                      <span className="required-star">*</span>
                    </label>
<input
  type="date"
  name="estimatedCompletion"
  value={formData.estimatedCompletion}
  onChange={handleChange}
  required
/>

                  
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>
                      Advance Payment
                    </label>
                    <input
                      type="number"
                      name="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleChange}
                      required
                      placeholder="Enter total value"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Total Value <span className="required-star">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalValue"
                      value={formData.totalValue}
                      // onChange={handleChange}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 8 && /^\d*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            totalValue: value,
                          }));
                        }
                      }}
                      required
                      placeholder="Enter total value"
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    id="notifyClientCheckbox"
                    type="checkbox"
                    checked={notifyClient}
                    onChange={() => setNotifyClient(!notifyClient)}
                    style={{ transform: "scale(1.2)", cursor: "pointer" }}
                  />

                  <label
                    style={{ margin: 0, fontSize: "14px", userSelect: "none" }}
                  >
                    Notify client about updated advance or total value
                  </label>
                </div>

                <div className="form-navigation">
                  <button
                    className="add-user-btna"
                    type="button"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-card">
                <h3>
                  Roles & Permissions <span className="required-star">*</span>
                </h3>
                <div className="roles-container-ui">
                  {allRoles.map((role) => (
                    <div
                      key={role}
                      className={`role-card ${
                        selectedRoles.includes(role) ? "active" : ""
                      }`}
                    >
                      <div className="role-header">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                          />
                          <span className="role-title">{role}</span>
                        </label>
                      </div>

                      {selectedRoles.includes(role) && usersByRole[role] && (
                        <div className="role-users">
                          {usersByRole[role].map((user) => (
                            <label key={user.id} className="user-checkbox-pill">
                              <input
                                type="checkbox"
                                checked={(
                                  formData.assignedTeamRoles[role] || []
                                ).includes(user.id)}
                                onChange={(e) =>
                                  handleUserCheckbox(
                                    role,
                                    user.id,
                                    e.target.checked
                                  )
                                }
                              />
                              {user.firstName} {user.lastName}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <br />
                <div className="form-group-row">
                  {/* Proposals & Presentations */}
                  <div className="form-group">
                    <label>Detailed Proposal </label>
                    <input
                      type="file"
                   
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("proposals", e)}
                    />
                    {formData.proposals && formData.proposals.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.proposals.map((url, idx) => {
                          const fileName = url.split("/").pop();
                          const fileExt = fileName.split(".").pop();
                          const fileUrl = url.startsWith("uploads")
                            ? `${url2}/${url}`
                            : url;

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("proposals", url)
                                }
                              >
                                X
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Floor Plans & CAD Files */}
                  <div className="form-group">
                    <label>Pro Forma Invoice</label>
                    <input
                      type="file"
   
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("floorPlans", e)}
                    />
                    {formData.floorPlans && formData.floorPlans.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.floorPlans.map((url, idx) => {
                          const fileName = url.split("/").pop();
                          const fileExt = fileName.split(".").pop();
                          const fileUrl = url.startsWith("uploads")
                            ? `${url2}/${url}`
                            : url;

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("floorPlans", url)
                                }
                              >
                                X
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>



                  {/*  */}
 <div className="form-group">
                    <label>Final Invoice</label>
                    <input
                      type="file"
   
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("finalInvoice", e)}
                    />
                    {formData.finalInvoice && formData.finalInvoice.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.finalInvoice.map((url, idx) => {
                          const fileName = url.split("/").pop();
                          const fileExt = fileName.split(".").pop();
                          const fileUrl = url.startsWith("uploads")
                            ? `${url2}/${url}`
                            : url;

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("finalInvoice", url)
                                }
                              >
                                X
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

{/*  */}




                  {/* Other Documents */}
                  <div className="form-group">
                    <label>Product Maintenance</label>
                    <input
                      type="file"
            
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("otherDocuments", e)}
                    />
                    {formData.otherDocuments &&
                      formData.otherDocuments.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.otherDocuments.map((url, idx) => {
                            const fileName = url.split("/").pop();
                            const fileExt = fileName.split(".").pop();
                            const fileUrl = url.startsWith("uploads")
                              ? `${url2}/${url}`
                              : url;

                            return (
                              <li key={idx}>
                                {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    width="100"
                                  />
                                ) : (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {fileName}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingFile(
                                      "otherDocuments",
                                      url
                                    )
                                  }
                                >
                                  X
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>
                  <div className="form-group">
                    <label>Options Presentation</label>
                    <input
                      type="file"
                      name="presentation"
              
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("presentation", e)}
                    />
                    {formData.presentation &&
                      formData.presentation.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.presentation.map((url, idx) => {
                            const fileName = url.split("/").pop();
                            const fileExt = fileName.split(".").pop();
                            const fileUrl = url.startsWith("uploads")
                              ? `${url2}/${url}`
                              : url;

                            return (
                              <li key={idx}>
                                {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    width="100"
                                  />
                                ) : (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {fileName}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingFile(
                                      "presentation",
                                      url
                                    )
                                  }
                                >
                                  X
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>
                  <div className="form-group">
                    <label>CAD Files</label>
                    <input
                      type="file"
                      name="cad"
        
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("cad", e)}
                    />
                    {formData.cad && formData.cad.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.cad.map((url, idx) => {
                          const fileName = url.split("/").pop();
                          const fileExt = fileName.split(".").pop();
                          const fileUrl = url.startsWith("uploads")
                            ? `${url2}/${url}`
                            : url;

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("cad", url)
                                }
                              >
                                X
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Sales Aggrement</label>
                    <input
                      type="file"
                      name="salesAggrement"
         
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("salesAggrement", e)}
                    />
                    {formData.salesAggrement &&
                      formData.salesAggrement.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.salesAggrement.map((url, idx) => {
                            const fileName = url.split("/").pop();
                            const fileExt = fileName.split(".").pop();
                            const fileUrl = url.startsWith("uploads")
                              ? `${url2}/${url}`
                              : url;

                            return (
                              <li key={idx}>
                                {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    width="100"
                                  />
                                ) : (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {fileName}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingFile(
                                      "salesAggrement",
                                      url
                                    )
                                  }
                                >
                                  X
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Acknowledgements</label>

                    <input
                      type="file"
          
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("acknowledgements", e)}
                    />

                    {formData.acknowledgements &&
                      formData.acknowledgements.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.acknowledgements.map((url, idx) => {
                            const fileName = url.split("/").pop();
                            const fileExt = fileName.split(".").pop();
                            const fileUrl = url.startsWith("uploads")
                              ? `${url2}/${url}`
                              : url;

                            return (
                              <li key={idx}>
                                {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    width="100"
                                  />
                                ) : (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {fileName}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingFile(
                                      "acknowledgements",
                                      url
                                    )
                                  }
                                >
                                  X
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>

                  <div className="form-group">
                    <label>Receiving Reports</label>

                    <input
                      type="file"
      
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("receivingReports", e)}
                    />

                    {formData.receivingReports &&
                      formData.receivingReports.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.receivingReports.map((url, idx) => {
                            const fileName = url.split("/").pop();
                            const fileExt = fileName.split(".").pop();
                            const fileUrl = url.startsWith("uploads")
                              ? `${url2}/${url}`
                              : url;

                            return (
                              <li key={idx}>
                                {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    width="100"
                                  />
                                ) : (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {fileName}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingFile(
                                      "receivingReports",
                                      url
                                    )
                                  }
                                >
                                  X
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </div>
                </div>
                <br />

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Delivery Hours</label>
                    <select
                      value={deliveryHourOption}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setDeliveryHourOption(selected);

                        const valueToSave =
                          selected === "Other" ? customDeliveryHour : selected;
                        handleChange({
                          target: { name: "deliveryHours", value: valueToSave },
                        });
                      }}
                    >
                      {predefinedOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>

                    {deliveryHourOption === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter custom delivery hours"
                        value={customDeliveryHour}
                        onChange={(e) => {
                          setCustomDeliveryHour(e.target.value);
                          handleChange({
                            target: {
                              name: "deliveryHours",
                              value: e.target.value,
                            },
                          });
                        }}
                        style={{ marginTop: "8px" }}
                      />
                    )}
                  </div>
                </div>

                <div className="form-card">
                  <h3>Project Lead Time Matrix</h3>
                  <table className="lead-time-table">
                    <thead className="lead-time">
                      <tr>
                        <th>Manufacturer Name</th>
                        <th>Description</th>
                        <th>
  <span
    title="To Be Determined: Check if the details (like delivery or arrival dates) are not yet finalized."
    style={{
      cursor: "pointer",
    }}
  >
    TBD
  </span>
</th>


                        <th>Expected Departure</th>
                        <th>Expected Arrival</th>
                        <th>Arrival Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadTimeItems.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>
                            <input
                              className="user-search-inputa"
                              value={item.itemName}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "itemName",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="user-search-inputa"
                              type="text"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              maxLength={50}
                            />
                          </td>

                          {/* ✅ TBD Checkbox Column */}
                          <td>
                            <input
                              type="checkbox"
                              checked={item.tbd || false}
                              onChange={(e) =>
                                handleItemChange(index, "tbd", e.target.checked)
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="edd"
                              type="date"
                              value={
                                item.expectedDeliveryDate?.slice(0, 10) || ""
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "expectedDeliveryDate",
                                  e.target.value
                                )
                              }
                              disabled={item.tbd}
                            />
                          </td>

                          <td>
                            <input
                              className="edd"
                              type="date"
                              value={
                                item.expectedArrivalDate?.slice(0, 10) || ""
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "expectedArrivalDate",
                                  e.target.value
                                )
                              }
                              disabled={item.tbd}
                            />
                          </td>


                          <td>
                            <input
                              className="edd"
                              type="date"
                              value={
                                item.arrivalDate?.slice(0, 10) || ""
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "arrivalDate",
                                  e.target.value
                                )
                              }
                              disabled={item.tbd}
                            />
                            </td>

                          <td>
                            <select
                              className="select-status"
                              value={item.status}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "status",
                                  e.target.value
                                )
                              }
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Installed">Installed</option>
                              <option value="Arrived">Arrived</option>
                            </select>
                          </td>

                          <td>
                            {item.id ? (
                              <div className="btn-up">
                                <button
                                  className="add-user-btna"
                                  type="button"
                                  onClick={() =>
                                    updateItem(leadTimeItems[index])
                                  }
                                >
                                  Update
                                </button>
                                <button
                                  className="add-user-btna"
                                  type="button"
                                  onClick={() => deleteItem(item.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <button
                                className="add-user-btna"
                                type="button"
                                onClick={() => addNewItemToBackend(item, index)}
                              >
                                Add
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <br />
                  <button
                    className="add-user-btna"
                    type="button"
                    onClick={handleAddItemRow}
                  >
                    + Add Row
                  </button>
                </div>

                <div className="form-navigation">
                  <button
                    className="add-user-btna"
                    type="button"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  {isLoading ? (
                    <SpinnerLoader size="30px" />
                  ) : (
                    <button className="add-user-btna" type="submit">
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProject;