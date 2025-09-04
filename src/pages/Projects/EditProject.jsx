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

const parseArrayish = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      if (Array.isArray(p)) return p;
    } catch (_) { }
    return v ? [v] : [];
  }
  return v ? [v] : [];
};

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [allRoles, setAllRoles] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [clicked, setClicked] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Corporate Office",
    clientName: [],
    description: "",
    clientId: [],
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
    finalInvoice: [],
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
  const [canEditMultipleClients, setCanEditMultipleClients] = useState(true);
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
          tbdETD: !!item.tbdETD,
          tbdETA: !!item.tbdETA,
          tbdArrival: !!item.tbdArrival,
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
    const roles = res.data?.data || [];

    const filtered = roles.filter((role) =>
      allowedLevels.includes(role.defaultPermissionLevel)
    );
    const roleTitles = filtered.map((role) => role.title);
    setAllRoles(roleTitles);
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const userRole = loggedInUser?.user?.userRole;
    const currentRoleObj = roles.find(r => r.title === userRole);
    const level = Number(currentRoleObj?.defaultPermissionLevel);
    setCanEditMultipleClients(currentRoleObj ? level !== 6 : true);
  };
  const isSet = (v) => v !== null && v !== undefined && String(v).trim() !== "";
  const validDateChoice = (dateVal, tbdFlag) =>
    (isSet(dateVal) && !tbdFlag) || (!isSet(dateVal) && !!tbdFlag);
  const validateItemRow = (row, idx) => {
    const touched =
      isSet(row.itemName) ||
      isSet(row.quantity) ||
      isSet(row.expectedDeliveryDate) ||
      isSet(row.expectedArrivalDate) ||
      isSet(row.arrivalDate) ||
      row.tbdETD || row.tbdETA || row.tbdArrival;

    if (!touched) return null;

    if (!row.itemName?.trim())
      return `Row ${idx + 1}: Manufacturer Name is required.`;

    if (!validDateChoice(row.expectedDeliveryDate, row.tbdETD))
      return `Row ${idx + 1}: For ETD, choose a date or mark TBD.`;

    if (!validDateChoice(row.expectedArrivalDate, row.tbdETA))
      return `Row ${idx + 1}: For ETA, choose a date or mark TBD.`;

    if (!validDateChoice(row.arrivalDate, row.tbdArrival))
      return `Row ${idx + 1}: For Arrival, choose a date or mark TBD.`;

    return null;
  };

  // (optional) used at submit to detect any unsaved filled rows
  const hasTouched = (r) =>
    isSet(r.itemName) || isSet(r.quantity) ||
    isSet(r.expectedDeliveryDate) || isSet(r.expectedArrivalDate) || isSet(r.arrivalDate) ||
    r.tbdETD || r.tbdETA || r.tbdArrival;


  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`${url}/projects/${projectId}`);
      const project = res.data;

      const parsedClientIds = parseArrayish(project.clientId).map((n) => Number(n));
      const parsedClientNames = parseArrayish(project.clientName);

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
      setInitialFinance({
        advancePayment: project.advancePayment,
        totalValue: project.totalValue,
      });
      setFormData({
        ...project,
        clientId: parsedClientIds,
        clientName: parsedClientNames,
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
      setLeadTimeMatrix(
        typeof project.leadTimeMatrix === "string"
          ? JSON.parse(project.leadTimeMatrix || "[]")
          : project.leadTimeMatrix || []
      );

      await fetchLeadTimeItems(projectId);
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
        arrivalDate: "",
        tbdETD: false,
        tbdETA: false,
        tbdArrival: false,
        status: "Pending",
        projectId,
      },
    ]);
  };

  const handleAddCustomer = (e) => {
    const idStr = e.target.value;
    if (!idStr) return;
    if (!canEditMultipleClients && (formData.clientId?.length || 0) >= 1) {
      toast.error("Your role allows only one customer for this project.");
      e.target.value = "";
      return;
    }

    const selected = customers.find((c) => String(c.id) === idStr);
    if (!selected) return;

    setFormData((prev) => {
      const ids = Array.isArray(prev.clientId) ? prev.clientId : [];
      const names = Array.isArray(prev.clientName) ? prev.clientName : [];
      if (ids.includes(selected.id)) return prev;

      return {
        ...prev,
        clientId: [...ids, selected.id],
        clientName: [...names, selected.full_name],
        deliveryAddress: prev.deliveryAddress || selected.delivery_address || "",
      };
    });
    e.target.value = "";
  };


  const removeCustomer = (idToRemove) => {
    setFormData((prev) => {
      const idx = (prev.clientId || []).indexOf(idToRemove);
      const newIds = (prev.clientId || []).filter((id) => id !== idToRemove);
      const newNames = (prev.clientName || []).filter((_, i) => i !== idx);
      return { ...prev, clientId: newIds, clientName: newNames };
    });
  };


  const addNewItemToBackend = async (item, index) => {
    const err = validateItemRow(item, index);
    if (err) {
      Swal.fire({ icon: "warning", title: "Invalid Lead Time Row", text: err });
      return;
    }
    try {
      const payload = buildItemPayload(item);
      delete payload.id; // new item
      const res = await axios.post(`${url}/items/project-items`, payload);
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
    setLeadTimeItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };

      if (field === "tbdETD") {
        row.tbdETD = value;
        if (value) row.expectedDeliveryDate = "";
      } else if (field === "tbdETA") {
        row.tbdETA = value;
        if (value) row.expectedArrivalDate = "";
      } else if (field === "tbdArrival") {
        row.tbdArrival = value;
        if (value) row.arrivalDate = "";
      } else {
        row[field] = value;
        // auto-uncheck TBD if a date is typed
        if (field === "expectedDeliveryDate" && value) row.tbdETD = false;
        if (field === "expectedArrivalDate" && value) row.tbdETA = false;
        if (field === "arrivalDate" && value) row.tbdArrival = false;
      }

      updated[index] = row;
      return updated;
    });
  };
  const toDateOnly = (d) => (d ? d : null);
  const buildItemPayload = (it) => ({
    id: it.id,
    projectId,
    itemName: it.itemName?.trim() || "",
    quantity: it.quantity || "",
    expectedDeliveryDate: it.tbdETD ? null : toDateOnly(it.expectedDeliveryDate),
    expectedArrivalDate: it.tbdETA ? null : toDateOnly(it.expectedArrivalDate),
    arrivalDate: it.tbdArrival ? null : toDateOnly(it.arrivalDate),
    status: it.status || "Pending",
    tbdETD: !!it.tbdETD,
    tbdETA: !!it.tbdETA,
    tbdArrival: !!it.tbdArrival,
  });


  const updateItem = async (item, index) => {
    const err = validateItemRow(item, index);
    if (err) {
      Swal.fire({ icon: "warning", title: "Invalid Lead Time Row", text: err });
      return;
    }
    try {
      const payload = buildItemPayload(item);
      await axios.put(`${url}/items/project-items/${item.id}`, payload);
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
        let users = res.data?.users || [];
        if (role === "Account Manager") {
          setClicked(true)
          const mercedesUser = {
            id: 143,
            firstName: "Mercedes",
            lastName: "",
          };

          // Prevent duplicates
          const userExists = users.find((u) => u.id === mercedesUser.id);
          if (!userExists) users.push(mercedesUser);
        }

        if (users.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "No Users Found",
            text: `There are no users available for the role "${role}".`,
          });
          return;
        }

        setSelectedRoles((prev) => [...prev, role]);
        setUsersByRole((prev) => ({ ...prev, [role]: users }));
        const preAssigned = formData.assignedTeamRoles[role] || [];
        const alreadyHasMercedes = preAssigned.includes(143);

        setFormData((prev) => ({
          ...prev,
          assignedTeamRoles: {
            ...prev.assignedTeamRoles,
            [role]: alreadyHasMercedes ? preAssigned : [],
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
    setClicked(true)
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
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    setFiles((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), ...selectedFiles],
    }));
    const previewFiles = selectedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setFormData((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), ...previewFiles],
    }));
  };

  const handleRemoveNewFile = (category, file) => {
    setFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((f) => f.name !== file.name),
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
    const unsavedTouched = leadTimeItems.some(r => !r.id && hasTouched(r));
    if (unsavedTouched) {
      Swal.fire({
        icon: "warning",
        title: "Unsaved Lead Time Rows",
        text: "Please 'Add' or remove the new Lead Time Matrix rows before submitting.",
      });
      return;
    }
    for (let i = 0; i < leadTimeItems.length; i++) {
      const msg = validateItemRow(leadTimeItems[i], i);
      if (msg) {
        Swal.fire({ icon: "warning", title: "Invalid Lead Time Matrix", text: msg });
        return;
      }
    }

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
    const { name, type, clientId, clientName, totalValue, advancePayment } = formData;

    if (step === 1) {
      if (!name.trim()) return "Project Name is required.";
      if (!type) return "Project Type is required.";

      if (!Array.isArray(clientId) || clientId.length === 0)
        return "Customer selection is required.";
      if (!Array.isArray(clientName) || clientName.length !== clientId.length)
        return "Selected client names and ids do not match.";

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
      if (!canEditMultipleClients && clientId.length > 1)
        return "Your role permits only one customer for this project.";

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
    localStorage.setItem("projectFormData", nextStep);
    setStep(step + 1);
    if (step !== 2) {
      setClicked(false)
    }
    setClicked(true)
  };

  const prevStep = () => setStep(step - 1);
  const projectFormData = localStorage.getItem("projectFormData");

  useEffect(() => {
    // Always add "Account Manager" to selectedRoles
    setSelectedRoles((prev) =>
      prev.includes("Account Manager") ? prev : [...prev, "Account Manager"]
    );
    // setClicked(true)

    // Always add Mercedes to usersByRole["Account Manager"]
    setUsersByRole((prev) => {
      const existingUsers = prev["Account Manager"] || [];
      const alreadyPresent = existingUsers.some((u) => u.id === 143);

      if (!alreadyPresent) {
        return {
          ...prev,
          "Account Manager": [
            ...existingUsers,
            { id: 143, firstName: "Mercedes", lastName: "" },
          ],
        };
      }
      return prev;
    });

    // ✅ Automatically check Mercedes (id 143) only if she's in the assignedTeamRoles
    const amUsers = formData.assignedTeamRoles?.["Account Manager"] || [];
    if (amUsers.includes(143)) {
      // Already checked – do nothing
      return;
    }

    // Optional: You can auto-check Mercedes the first time
    // setFormData((prev) => ({
    //   ...prev,
    //   assignedTeamRoles: {
    //     ...prev.assignedTeamRoles,
    //     "Account Manager": [...amUsers, 143],
    //   },
    // }));
  }, [projectFormData, clicked]);
  const handleMoneyChange = (name) => (e) => {
    let v = e.target.value;

    // allow clearing
    if (v === "") {
      setFormData((p) => ({ ...p, [name]: "" }));
      return;
    }

    // keep only digits and a single dot
    if (!/^\d*\.?\d*$/.test(v)) return;

    // limit integer part to 8 digits, decimals to 2
    const [intPartRaw, decRaw = ""] = v.split(".");
    const intPart = intPartRaw.slice(0, 8);
    const decPart = decRaw.slice(0, 2);

    const next = decRaw !== "" ? `${intPart}.${decPart}` : intPart;
    setFormData((p) => ({ ...p, [name]: next }));
  };

  const normalizeMoneyOnBlur = (name) => (e) => {
    const v = e.target.value;
    if (v === "" || v === ".") return;
    const n = Number(v);
    if (Number.isFinite(n)) {
      // format to 2 decimals on blur
      setFormData((p) => ({ ...p, [name]: n.toFixed(2) }));
    }
  };


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
                      onChange={handleAddCustomer}
                      value=""
                      required={!(formData.clientId && formData.clientId.length)}
                      disabled={!canEditMultipleClients && (formData.clientId?.length || 0) >= 1}
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.full_name} ({customer.email})
                        </option>
                      ))}
                    </select>

                    {!canEditMultipleClients && (formData.clientId?.length || 0) >= 1 && (
                      <small className="help-text">Only one customer allowed for your role. Remove the current one to pick another.</small>
                    )}

                    <div className="selected-customers" style={{ marginTop: 8 }}>
                      {formData.clientId?.map((cid, idx) => {
                        const name = formData.clientName?.[idx] ?? `#${cid}`;
                        const c = customers.find((cc) => cc.id === cid);
                        return (
                          <span key={cid} className="chip">
                            {name}{c ? ` (${c.email})` : ""}
                            <button
                              type="button"
                              className="chip-close"
                              aria-label={`Remove ${name}`}
                              onClick={() => removeCustomer(cid)}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
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
                      type="text"
                      name="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleChange}
                      required
                      placeholder="Enter total value"
                      onInput={(e) => {
                        const value = e.target.value;
                        const regex = /^\d*\.?\d{0,2}$/;
                        if (!regex.test(value)) {
                          e.target.value = formData.advancePayment;
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Total Value <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      name="totalValue"
                      value={formData.totalValue}
                      onChange={handleMoneyChange("totalValue")}
                      onBlur={normalizeMoneyOnBlur("totalValue")}
                      required
                      placeholder="Enter total value"
                      onInput={(e) => {
                        const value = e.target.value;
                        const regex = /^\d*\.?\d{0,2}$/;
                        if (!regex.test(value)) {
                          e.target.value = formData.totalValue;
                        }
                      }}
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
                      className={`role-card ${selectedRoles.includes(role) ? "active" : ""
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("proposals", e)}
                    />
                    {formData.proposals && formData.proposals.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.proposals.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("proposals", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("floorPlans", e)}
                    />
                    {formData.floorPlans && formData.floorPlans.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.floorPlans.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("floorPlans", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("finalInvoice", e)}
                    />
                    {formData.finalInvoice && formData.finalInvoice.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.finalInvoice.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("finalInvoice", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("otherDocuments", e)}
                    />
                    {formData.otherDocuments && formData.otherDocuments.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.otherDocuments.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("otherDocuments", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("presentation", e)}
                    />
                    {formData.presentation && formData.presentation.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.presentation.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("presentation", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("cad", e)}
                    />
                    {formData.cad && formData.cad.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.cad.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("cad", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("salesAggrement", e)}
                    />
                    {formData.salesAggrement && formData.salesAggrement.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.salesAggrement.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("salesAggrement", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("acknowledgements", e)}
                    />

                    {formData.acknowledgements && formData.acknowledgements.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.acknowledgements.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("acknowledgements", item)
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
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange("receivingReports", e)}
                    />

                    {formData.receivingReports && formData.receivingReports.length > 0 && (
                      <ul className="file-preview-list">
                        {formData.receivingReports.map((item, idx) => {
                          const isString = typeof item === "string";
                          const fileUrl = isString
                            ? item.startsWith("uploads") ? `${url2}/${item}` : item
                            : item.url;
                          const fileName = isString ? item.split("/").pop() : item.name;
                          const fileExt = fileName.split(".").pop().toLowerCase();

                          return (
                            <li key={idx}>
                              {["jpg", "jpeg", "png"].includes(fileExt) ? (
                                <img src={fileUrl} alt={fileName} width="100" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  {fileName}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingFile("receivingReports", item)
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
                        <th>Expected Departure (ETD)</th>
                        <th>Expected Arrival (ETA)</th>
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
                          {/* <td>
                            <input
                              type="checkbox"
                              checked={item.tbd || false}
                              onChange={(e) =>
                                handleItemChange(index, "tbd", e.target.checked)
                              }
                            />
                          </td> */}

                          {/* ETD */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                className="edd"
                                type="date"
                                value={
                                  item.tbdETD ? "" : (item.expectedDeliveryDate?.slice(0, 10) || "")
                                }
                                onChange={(e) =>
                                  handleItemChange(index, "expectedDeliveryDate", e.target.value)
                                }
                                disabled={item.tbdETD}
                              />
                              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!item.tbdETD}
                                  onChange={(e) => handleItemChange(index, "tbdETD", e.target.checked)}
                                />
                                TBD
                              </label>
                            </div>
                          </td>

                          {/* ETA */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                className="edd"
                                type="date"
                                value={
                                  item.tbdETA ? "" : (item.expectedArrivalDate?.slice(0, 10) || "")
                                }
                                onChange={(e) =>
                                  handleItemChange(index, "expectedArrivalDate", e.target.value)
                                }
                                disabled={item.tbdETA}
                              />
                              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!item.tbdETA}
                                  onChange={(e) => handleItemChange(index, "tbdETA", e.target.checked)}
                                />
                                TBD
                              </label>
                            </div>
                          </td>

                          {/* Arrival */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                className="edd"
                                type="date"
                                value={item.tbdArrival ? "" : (item.arrivalDate?.slice(0, 10) || "")}
                                onChange={(e) =>
                                  handleItemChange(index, "arrivalDate", e.target.value)
                                }
                                disabled={item.tbdArrival}
                              />
                              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!item.tbdArrival}
                                  onChange={(e) =>
                                    handleItemChange(index, "tbdArrival", e.target.checked)
                                  }
                                />
                                TBD
                              </label>
                            </div>
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
                                  onClick={() => updateItem(leadTimeItems[index], index)}
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