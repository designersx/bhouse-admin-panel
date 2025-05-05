import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import "../../styles/Projects/AddProject.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { url } from "../../lib/api";
import BackButton from "../../components/BackButton";
import SpinnerLoader from "../../components/SpinnerLoader";
const AddProject = () => {
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("addProjectStep");
    return savedStep ? Number(savedStep) : 1;
  });

  let [clientId, setClientId] = useState();
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("addProjectFormData");
    return savedData
      ? JSON.parse(savedData)
      : {
        name: "",
        type: "Corporate Office",
        clientName: "",
        description: "",
        startDate: "",
        estimatedCompletion: "",
        totalValue: "",
        advancePayment: "",
        deliveryAddress: "",
        deliveryHours: "",
        assignedTeamRoles: {},
        clientId: "",
      };
  });

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleUsers, setRoleUsers] = useState({});
  const [allRoles, setAllRoles] = useState([]);
  const [files, setFiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leadTimeMatrix, setLeadTimeMatrix] = useState(() => {
    const savedMatrix = localStorage.getItem("addProjectLeadMatrix");
    return savedMatrix
      ? JSON.parse(savedMatrix)
      : [
        {
          itemName: "",
          quantity: "",
          expectedDeliveryDate: "",
          expectedArrivalDate: "",
          status: "Pending",
        },
      ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [deliveryHourOption, setDeliveryHourOption] = useState(
    formData.deliveryHours || "Regular Hours"
  );
  const [customDeliveryHour, setCustomDeliveryHour] = useState(
    ["Regular Hours", "Before 9 AM", "After 6 PM"].includes(
      formData.deliveryHours
    )
      ? ""
      : formData.deliveryHours || ""
  );
  useEffect(() => {
    localStorage.setItem("addProjectStep", step);
  }, [step]);

  useEffect(() => {
    localStorage.setItem("addProjectFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(
      "addProjectLeadMatrix",
      JSON.stringify(leadTimeMatrix)
    );
  }, [leadTimeMatrix]);

  const navigate = useNavigate();

  const validateStep1 = () => {
    const {
      name,
      type,
      clientName,
      estimatedCompletion,
      totalValue,
      advancePayment,
    } = formData;

    const today = new Date().toISOString().split("T")[0];

    if (!name.trim()) return "Project Name is required.";
    if (!/[a-zA-Z]/.test(name))
      return "Project Name must include at least one alphabet character.";
    if (!type) return "Project Type is required.";
    if (!clientName) return "Customer selection is required.";

    if (!estimatedCompletion) return "Estimated Occupancy Date is required.";
    // if (estimatedCompletion < today)

    //   return "Estimated Occupancy Date cannot be in the past.";

    if (!totalValue || totalValue <= 0)
      return "Total Value must be a positive number.";
    if (
      advancePayment !== undefined &&
      advancePayment !== null &&
      advancePayment !== "" &&
      advancePayment <= 0
    ) {
      return "Advance Payment must be a positive number.";
    }

    if (parseFloat(advancePayment) > parseFloat(totalValue)) {
      return "Advance Payment cannot be more than Total Value.";
    }

    return null;
  };

  const validateStep2 = () => {
    if (deliveryHourOption === "Other") {
      const trimmed = customDeliveryHour.trim();
      const invalidCharsRegex = /[^a-zA-Z0-9\s:-]/;
      const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

      if (!trimmed) {
        return "Please enter valid custom delivery hours.";
      }
      if (invalidCharsRegex.test(trimmed) || emojiRegex.test(trimmed)) {
        return "Delivery hours should not contain special characters or emojis.";
      }
    }

    // ✅ Mandatory: At least one user must be selected under Account Manager
    const amUsers = formData.assignedTeamRoles["Account Manager"];
    if (!amUsers || amUsers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Account Manager",
        text: "You must assign at least one user under the 'Account Manager' role.",
      });
      return "__swal__";
    }

    return null;
  };

  const nextStep = () => {
    let errorMsg = null;

    if (step === 1) errorMsg = validateStep1();
    else if (step === 2) errorMsg = validateStep2();

    if (errorMsg) {
      toast.error(`Error: ${errorMsg}`);
      return;
    }

    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleItemChange = (index, field, value) => {
    const updated = [...leadTimeMatrix];

    if (field === "tbd") {
      updated[index][field] = value;
      if (value) {
        // If TBD is true, clear both dates
        updated[index].expectedDeliveryDate = "";
        updated[index].expectedArrivalDate = "";
      }
    } else {
      updated[index][field] = value;
    }

    setLeadTimeMatrix(updated);
  };
  const handleAddItemRow = () => {
    setLeadTimeMatrix([
      ...leadTimeMatrix,
      {
        itemName: null,
        quantity: null,
        expectedDeliveryDate: null,
        expectedArrivalDate: null,
        status: "Pending",
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    const updated = [...leadTimeMatrix];
    updated.splice(index, 1);
    setLeadTimeMatrix(updated);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        const activeCustomers = (data || []).filter(
          (customer) => customer.status == "active"
        );
        setCustomers(activeCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleRoleToggle = async (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
      setRoleUsers((prev) => {
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
        const encodedRole = encodeURIComponent(role);
        const res = await fetch(`${url}/auth/users-by-role/${encodedRole}`);
        const data = await res.json();
        const users = data.users || [];

        if (users.length === 0) {
          toast.error(`No users found in the role "${role}"`);
          return;
        }

        setSelectedRoles((prev) => [...prev, role]);
        setRoleUsers((prev) => ({ ...prev, [role]: users }));

        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const loggedInUserId = loggedInUser?.user?.id;
        const loggedInUserRole = loggedInUser?.user?.userRole;

        let defaultUserIds = [];

        if (
          loggedInUserRole === "Account Manager" &&
          users.some((user) => user.id === loggedInUserId)
        ) {
          defaultUserIds = [loggedInUserId];
        } else {
          const defaultUsers = users.filter(
            (user) => user.permissionLevel === 2
          );
          defaultUserIds = defaultUsers.map((user) => user.id);
        }

        setFormData((prev) => ({
          ...prev,
          assignedTeamRoles: {
            ...prev.assignedTeamRoles,
            [role]: defaultUserIds,
          },
        }));
      } catch (err) {
        console.error(`Error fetching users for role ${role}`, err);
        toast.error("Something went wrong while fetching users.");
      }
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch(`${url}/roles`);
      const data = await res.json();
      if (data.success) {
        const allowedLevels = [2, 3, 4, 5, 6, 7, 8, 9];

        const filtered = data.data.filter((role) =>
          allowedLevels.includes(role.defaultPermissionLevel)
        );
        const roleTitles = filtered.map((role) => role.title);
        setAllRoles(roleTitles);

        // ✅ Pre-select "Account Manager" if current user has that role
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const userRole = loggedInUser?.user?.userRole;

        if (
          userRole === "Account Manager" &&
          roleTitles.includes("Account Manager")
        ) {
          // Simulate toggle to auto-select
          handleRoleToggle("Account Manager");
        }
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    const transformedRoles = Object.entries(formData.assignedTeamRoles).map(
      ([role, users]) => ({
        role,
        users: Array.isArray(users) ? users : [],
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
    Object.keys(formData).forEach((key) => {
      if (key !== "assignedTeamRoles") {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    formDataToSend.append(
      "assignedTeamRoles",
      JSON.stringify(transformedRoles)
    );
    const sanitizedMatrix = leadTimeMatrix.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      expectedDeliveryDate: item.expectedDeliveryDate
        ? new Date(item.expectedDeliveryDate)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
        : null,
      expectedArrivalDate: item.expectedArrivalDate
        ? new Date(item.expectedArrivalDate)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
        : null,
      status: item.status || "Pending",
    }));
    console.log(sanitizedMatrix);
    if (sanitizedMatrix[0].itemName !== "") {
      formDataToSend.append("leadTimeMatrix", JSON.stringify(sanitizedMatrix));
    }

    for (let file of files) {
      formDataToSend.append("files", file);
    }
    for (let file of formData.proposals || []) {
      formDataToSend.append("proposals", file);
    }
    for (let file of formData.floorPlans || []) {
      formDataToSend.append("floorPlans", file);
    }
    for (let file of formData.otherDocuments || []) {
      formDataToSend.append("otherDocuments", file);
    }
    for (let file of formData.presentation || []) {
      formDataToSend.append("presentation", file);
    }
    for (let file of formData.cad || []) {
      formDataToSend.append("cad", file);
    }
    for (let file of formData.salesAggrement || []) {
      formDataToSend.append("salesAggrement", file);
    }
    for (let file of formData.receivingReports || []) {
      formDataToSend.append("receivingReports", file);
    }
    for (let file of formData.acknowledgements || []) {
      formDataToSend.append("acknowledgements", file);
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${url}/projects`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.status === 201) {
        localStorage.removeItem("addProjectStep");
        localStorage.removeItem("addProjectFormData");
        localStorage.removeItem("addProjectLeadMatrix");
        Swal.fire("Project added successfully!");
        navigate("/projects");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Error: ${data.error}`,
        });
      }
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileInputChange = (e, fieldName) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: [file],
    }));
  };

  // const validateLeadTimeMatrix = () => {
  //   const today = new Date().toISOString().split("T")[0];

  //   for (let i = 0; i < leadTimeMatrix.length; i++) {
  //     const item = leadTimeMatrix[i];

  //     if (!item.itemName.trim()) return `Manufacturer name is required at row ${i + 1}`;
  //     if (!/^[a-zA-Z\s]+$/.test(item.itemName)) return `Manufacturer name must contain only letters at row ${i + 1}`;

  //     if (!item.quantity.trim()) return `Description is required at row ${i + 1}`;
  //     if (!/^[\w\s]+$/.test(item.quantity)) return `Description must be alphanumeric at row ${i + 1}`;

  //     if (!item.expectedDeliveryDate) return `Expected delivery date is required at row ${i + 1}`;
  //     if (!item.expectedArrivalDate) return `Expected arrival date is required at row ${i + 1}`;

  //     if (item.expectedDeliveryDate < today) return `Expected delivery date cannot be in the past at row ${i + 1}`;
  //     if (item.expectedArrivalDate < item.expectedDeliveryDate) return `Arrival date cannot be before delivery date at row ${i + 1}`;
  //   }

  //   return null;
  // };
  const handleRemoveFile = (field, index) => {
    setFormData((prev) => {
      const updatedFiles = prev[field]?.filter((_, idx) => idx !== index) || [];
      return { ...prev, [field]: updatedFiles };
    });
  };

  return (
    <Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <div className="add-project-container">
        <BackButton />

        <h2>Add New Project</h2>
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
                      Project Name <span className="required-star">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter project name"
                      maxLength={40}
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
                      required
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
                      name="clientName"
                      value={formData.clientId}
                      onChange={(e) => {
                        const selectedCustomer = customers.find(
                          (customer) => String(customer.id) === e.target.value
                        );

                        setFormData({
                          ...formData,
                          clientName: selectedCustomer?.full_name || "",
                          clientId: selectedCustomer?.id || "",
                          deliveryAddress:
                            selectedCustomer?.delivery_address || "",
                        });
                        setClientId(selectedCustomer?.id);
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
                      placeholder="Enter project description"
                      maxLength={60}
                    ></textarea>
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
                      required
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
                  {/* <div className="form-group">
                    <label>
                      Estimated Occupancy Date{" "}
                      <span className="required-star">*</span>
                    </label>

                    <input
                      type="date"
                      name="estimatedCompletion"
                      value={formData.estimatedCompletion}
                      min={
                        formData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={handleChange}
                      required
                    />
                  </div> */}
                  <div className="form-group">
                    <label>
                      Estimated Occupancy Date{" "}
                      <span className="required-star">*</span>
                    </label>

                    <select
                      name="estimatedCompletion"
                      value={formData.estimatedCompletion}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Completion Time</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => (
                        <option key={week} value={`${week}_weeks`}>
                          {week} Week{week > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Advance Payment</label>

                    <input
                      type="number"
                      name="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleChange}
                      maxLength={8}
                      required
                      placeholder="Enter Advance Amount"
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
                      maxLength={8}
                      required
                      placeholder="Enter total value"
                    />
                  </div>
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={nextStep}>
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
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Assign Roles</label>
                    <div className="roles-container-ui">
                      {allRoles.map((role) => (
                        <div
                          key={role}
                          className={`role-card ${selectedRoles.includes(role) ? "active" : ""
                            }`}
                        >
                          <div className="role-header">
                            <label>
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(role)}
                                onChange={() => handleRoleToggle(role)}
                              />
                              <span className="role-title">{role}</span>
                            </label>
                          </div>

                          {selectedRoles.includes(role) && roleUsers[role] && (
                            <div className="role-users">
                              {roleUsers[role].map((user) => {
                                const isChecked = (
                                  formData.assignedTeamRoles[role] || []
                                ).includes(user.id);
                                return (
                                  <label
                                    key={user.id}
                                    className="user-checkbox-pill"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const prevSelected =
                                          formData.assignedTeamRoles[role] ||
                                          [];
                                        const updatedUsers = e.target.checked
                                          ? [...prevSelected, user.id]
                                          : prevSelected.filter(
                                            (id) => id !== user.id
                                          );

                                        setFormData((prev) => ({
                                          ...prev,
                                          assignedTeamRoles: {
                                            ...prev.assignedTeamRoles,
                                            [role]: updatedUsers,
                                          },
                                        }));
                                      }}
                                    />
                                    {user.firstName} {user.email}
                                  </label>
                                );
                              })}
                              {role === "Account Manager" &&
                                (!formData.assignedTeamRoles[
                                  "Account Manager"
                                ] ||
                                  formData.assignedTeamRoles["Account Manager"]
                                    .length === 0) && (
                                  <div className="validation-error">
                                    Please select at least one user for Account
                                    Manager.
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Detailed Proposal</label>
                    <input
                      type="file"
                      name="proposals"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileInputChange(e, "proposals")}
                      disabled={!!formData.proposals?.length}
                    />

                    {formData.proposals && formData.proposals.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.proposals.map((file, idx) => (
                          <li key={idx}>
                            <a
                              href={URL.createObjectURL(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile("proposals", idx)}
                            >
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Floor Plans</label>
                    <input
                      type="file"
                      name="floorPlans"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileInputChange(e, "floorPlans")}
                      disabled={!!formData.floorPlans?.length}
                    />

                    {formData.floorPlans && formData.floorPlans.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.floorPlans.map((file, idx) => (
                          <li key={idx}>
                            <a
                              href={URL.createObjectURL(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFile("floorPlans", idx)
                              }
                            >
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Product Maintenance</label>
                    <input
                      type="file"
                      name="otherDocuments"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        handleFileInputChange(e, "otherDocuments")
                      }
                      disabled={!!formData.otherDocuments?.length}
                    />

                    {formData.otherDocuments?.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.otherDocuments &&
                          formData.otherDocuments.length > 0 && (
                            <ul className="file-preview-list">
                              {formData.otherDocuments.map((file, idx) => (
                                <li key={idx}>
                                  <a
                                    href={URL.createObjectURL(file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {file.name}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveFile("otherDocuments", idx)
                                    }
                                  >
                                    &times;
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                      </ul>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Acknowledgements</label>
                    <input
                      type="file"
                      name="acknowledgements"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        handleFileInputChange(e, "acknowledgements")
                      }
                      disabled={!!formData.acknowledgements?.length}
                    />

                    {formData.acknowledgements &&
                      formData.acknowledgements.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.acknowledgements.map((file, idx) => (
                            <li key={idx}>
                              <a
                                href={URL.createObjectURL(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile("acknowledgements", idx)
                                }
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <div className="form-group">
                    <label>Receiving Reports</label>
                    <input
                      type="file"
                      name="receivingReports"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        handleFileInputChange(e, "receivingReports")
                      }
                      disabled={!!formData.receivingReports?.length}
                    />

                    {formData.receivingReports &&
                      formData.receivingReports.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.receivingReports.map((file, idx) => (
                            <li key={idx}>
                              <a
                                href={URL.createObjectURL(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile("receivingReports", idx)
                                }
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  <div className="form-group">
                    <label>Options Presentation</label>
                    <input
                      type="file"
                      name="presentation"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileInputChange(e, "presentation")}
                      disabled={!!formData.presentation?.length}
                    />

                    {formData.presentation &&
                      formData.presentation.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.presentation.map((file, idx) => (
                            <li key={idx}>
                              <a
                                href={URL.createObjectURL(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile("presentation", idx)
                                }
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <div className="form-group">
                    <label>CAD Files</label>
                    <input
                      type="file"
                      name="cad"
                      accept=".pdf"
                      onChange={(e) => handleFileInputChange(e, "cad")}
                    />
                    {formData.cad && formData.cad.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.cad.map((file, idx) => (
                          <li key={idx}>
                            <a
                              href={URL.createObjectURL(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile("cad", idx)}
                            >
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Sales Aggrement</label>
                    <input
                      type="file"
                      name="salesAggrement"
                      disabled={!!formData.salesAggrement?.length}
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        handleFileInputChange(e, "salesAggrement")
                      }
                    />

                    {formData.salesAggrement &&
                      formData.salesAggrement.length > 0 && (
                        <ul className="file-preview-list">
                          {formData.salesAggrement.map((file, idx) => (
                            <li key={idx}>
                              <a
                                href={URL.createObjectURL(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile("salesAggrement", idx)
                                }
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Enter delivery address"
                      maxLength={50}
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

                        // Update formData
                        handleChange({
                          target: { name: "deliveryHours", value: valueToSave },
                        });
                      }}
                    >
                      <option value="Regular Hours">Regular Hours</option>
                      <option value="Before 9 AM">Before 9 AM</option>
                      <option value="After 6 PM">After 6 PM</option>
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
                      />
                    )}
                  </div>
                </div>

                <h3>Project Lead Time Matrix</h3>
                <div className="lead-time-matrix-container">
                  {leadTimeMatrix.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="form-group1">
                        <label>Manufacturer Name</label>
                        <input
                          className="user-search-input1"
                          type="text"
                          placeholder="Manufacturer Name"
                          value={item.itemName}
                          onChange={(e) =>
                            handleItemChange(index, "itemName", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group1">
                        <label>Description</label>
                        <input
                          className="user-search-input1"
                          type="text"
                          placeholder="Description"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          maxLength={50}
                        />
                      </div>

                      {/* ✅ TBD Checkbox */}
                      <div className="form-group1">
                      <label>
  <span
    title="To Be Determined: Check if the details (like delivery or arrival dates) are not yet finalized."
    style={{
      cursor: "pointer",  
    }}
  >
    TBD
  </span>
</label>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.tbd || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              handleItemChange(index, "tbd", checked);
                              if (checked) {
                                handleItemChange(
                                  index,
                                  "expectedDeliveryDate",
                                  ""
                                );
                                handleItemChange(
                                  index,
                                  "expectedArrivalDate",
                                  ""
                                );
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group1">
                        <label>Expected Delivery Date</label>
                        <input
                          className="user-search-input1"
                          type="date"
                          value={item.expectedDeliveryDate}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={item.tbd}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "expectedDeliveryDate",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group1">
                        <label>Expected Arrival Date</label>
                        <input
                          className="user-search-input1"
                          type="date"
                          value={item.expectedArrivalDate}
                          min={
                            item.expectedDeliveryDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          disabled={item.tbd}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "expectedArrivalDate",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group1">
                        <label>Status</label>
                        <select
                          className="user-search-input1"
                          value={item.status}
                          onChange={(e) =>
                            handleItemChange(index, "status", e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Installed">Installed</option>
                          <option value="Arrived">Arrived</option>
                        </select>
                      </div>

                      {leadTimeMatrix.length > 1 && (
                        <button
                          className="add-user-btn"
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    className="add-user-btn"
                    type="button"
                    onClick={handleAddItemRow}
                  >
                    Add Row
                  </button>
                </div>
                <br />

                <div className="form-navigation">
                  <button type="button" onClick={prevStep}>
                    Previous
                  </button>
                  {isLoading ? (
                    <SpinnerLoader size="30px" />
                  ) : (
                    <button type="submit">Submit</button>
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

export default AddProject;
