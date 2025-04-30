import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/Projects/ProjectDetails.css";
import { url, url2 } from "../../lib/api";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";
import { ToastContainer } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { FaEye, FaComment, FaDownload, FaCommentAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import BackButton from "../../components/BackButton";
import { MdEdit } from "react-icons/md";
import Offcanvas from "../../components/OffCanvas/OffCanvas";
import { FaTelegramPlane } from "react-icons/fa";
import useRolePermissions from "../../hooks/useRolePermissions";
import InvoiceManagement from "./InvoiceManagment";
import SpinnerLoader from "../../components/SpinnerLoader";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchListLoading, setPunchListLoading] = useState(false);
  const [punchstatusLoading, setPunchStatusLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeTabing, setActiveTabing] = useState("Admin");
  const navigate = useNavigate();
  const [editableRows, setEditableRows] = useState({});
  const [punchList, setPunchList] = useState([]);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [groupedComments, setGroupedComments] = useState({});
  const [isItemCanvasOpen, setIsItemCanvasOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemComments, setItemComments] = useState([]);
  const [groupedItemComments, setGroupedItemComments] = useState({});
  const [itemCommentText, setItemCommentText] = useState("");
  const [dataDoc, setDataDoc] = useState();
  const [isPunchCanvasOpen, setIsPunchCanvasOpen] = useState(false);
  const [selectedPunchItemId, setSelectedPunchItemId] = useState(null);
  const [punchComments, setPunchComments] = useState([]);
  const [groupedPunchComments, setGroupedPunchComments] = useState({});
  const [punchCommentText, setPunchCommentText] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [docsData, setDocsData] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const [notifyCustomerLoading, setNotifyCustomerLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    userComments,
    newCommentText,
    groupedComments,
    itemCommentText,
    punchCommentText,
    groupedPunchComments,
    groupedItemComments,
  ]);
  const docMap = {
    "Sample COI": "Sample COI",
    "COI (Certificate)": "COI (Certificate)",
    "Pro Forma Invoice": "Pro Forma Invoice",
    "Final Invoice": "Final Invoice",
    "Sales Agreement": "Sales Agreement",
  };
  const normalize = (str) => str.trim().toLowerCase();

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${url}/customerDoc/document/${projectId}`);
      const docsArray = res.data || [];
      console.log(docsArray, "docArray");
      const docMapData = {};
      setDataDoc(docsArray);
      docsArray.forEach((doc) => {
        docMapData[doc.documentType] = doc.filePath;
      });
      console.log(docMapData, "docMapData");
      setDocsData(docMapData);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const openPunchComment = async (punchId) => {
    try {
      setSelectedPunchItemId(punchId);
      const res = await axios.get(`${url}/punchlist/${punchId}/comments`);
      setPunchComments(res.data);

      const grouped = res.data.reduce((acc, comment) => {
        const date = new Date(comment.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(comment);
        return acc;
      }, {});

      setGroupedPunchComments(grouped);
      setIsPunchCanvasOpen(true);
    } catch (err) {
      console.error("Error fetching punch list comments:", err);
    }
  };
  const handleAddPunchComment = async () => {
    setCommentLoading(true);
    const user = JSON.parse(localStorage.getItem("user"))?.user;
    const customer = JSON.parse(localStorage.getItem("customer"));

    const createdById = user?.id || customer?.id;
    const createdByType = user ? "user" : "customer";

    if (!punchCommentText.trim()) return;

    try {
      await axios.post(
        `${url}/projects/${projectId}/punchlist/${selectedPunchItemId}/comments`,
        {
          comment: punchCommentText,
          userId: createdByType === "user" ? createdById : null,
          clientId: createdByType === "customer" ? createdById : null,
        }
      );

      setPunchCommentText("");
      openPunchComment(selectedPunchItemId); // refresh
    } catch (err) {
      console.error("Failed to add punch comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const openItemComment = async (itemId) => {
    try {
      setSelectedItemId(itemId);
      const res = await axios.get(`${url}/items/${itemId}/comments`);

      const grouped = res.data.reduce((acc, comment) => {
        const date = new Date(comment.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(comment);
        return acc;
      }, {});

      setItemComments(res.data);
      setGroupedItemComments(grouped);
      setIsItemCanvasOpen(true);
    } catch (err) {
      console.error("Error fetching item comments:", err);
    }
  };

  const handleAddItemComment = async () => {
    setCommentLoading(true);
    const user = JSON.parse(localStorage.getItem("user"))?.user;
    const customer = JSON.parse(localStorage.getItem("customer"));

    const creatorId = user?.id || customer?.id;
    const creatorType = user ? "user" : "customer";

    if (!itemCommentText.trim()) return;

    try {
      await axios.post(`${url}/items/${selectedItemId}/comments`, {
        comment: itemCommentText,
        createdById: creatorId,
        createdByType: creatorType,
        projectId: projectId,
      });

      setItemCommentText("");
      openItemComment(selectedItemId);
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };
  const [selectedFiles, setSelectedFiles] = useState({
    proposals: [],
    floorPlans: [],
    otherDocuments: [],
    presentation: [],
    salesAggrement: [],
    cad: [],

    acknowledgements: [],
    receivingReports: [],
  });
  const roleId = JSON.parse(localStorage.getItem("user"));
  const { rolePermissions } = useRolePermissions(roleId?.user?.roleId);

  const [newIssue, setNewIssue] = useState({
    title: "",
    issueDescription: "",
    projectItemId: "",
    productImages: [],
  });
  const [projectItems, setProjectItems] = useState([]);
  const fetchUserComments = async (toUserId) => {
    try {
      const res = await axios.get(
        `${url}/projects/${projectId}/user-comments/${toUserId}`
      );
      setUserComments(res.data);

      // Group by date
      const grouped = res.data.reduce((acc, comment) => {
        const date = new Date(comment.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(comment);
        return acc;
      }, {});
      setGroupedComments(grouped);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };
  const fetchComments = async () => {
    if (selectedUser) {
      await fetchUserComments(selectedUser.id);
    }
  };

  const handleOpenComments = async (user) => {
    setSelectedUser(user);
    await fetchUserComments(user.id);
    setIsOffcanvasOpen(true);
  };

  const handleAddComment = async () => {
    setCommentLoading(true);
    const stored = JSON.parse(localStorage.getItem("user"));
    const fromUserId = stored?.user?.id;

    if (!newCommentText.trim()) return;

    try {
      await axios.post(`${url}/projects/${projectId}/user-comments`, {
        fromUserId,
        toUserId: selectedUser.id,
        comment: newCommentText,
      });

      setNewCommentText("");
      await fetchUserComments(selectedUser.id);
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${url}/items/${projectId}`)
      .then((res) => setProjectItems(res.data))
      .catch((err) => console.error("Failed to load items:", err));
  }, [projectId, showPunchModal]);
  const fetchPunchList = async () => {
    try {
      const res = await axios.get(`${url}/projects/${projectId}/punch-list`);
      const parsed = res.data.map((issue) => ({
        ...issue,
        productImages:
          typeof issue.productImages === "string"
            ? JSON.parse(issue.productImages)
            : Array.isArray(issue.productImages)
              ? issue.productImages
              : [],
      }));
      setPunchList(parsed);
      const initialStatus = {};
      parsed.forEach((item) => {
        initialStatus[item.id] = item.status || "Pending";
      });
      setStatusMap(initialStatus);
    } catch (err) {
      console.error("Error fetching punch list:", err);
    }
  };
  useEffect(() => {
    fetchPunchList();
  }, [projectId, showPunchModal]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const updateItem = async (item) => {
    try {
      await axios.put(`${url}/items/project-items/${item.id}`, item);
      toast.success("Item updated!");
    } catch (err) {
      toast.error("Error updating item.");
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${url}/items/project-items/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMatrix((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item deleted!");
    } catch (err) {
      toast.error("Error deleting item.");
      console.error(err);
    }
  };

  const addNewItemToBackend = async (item, index) => {
    setButtonClicked(true);
    try {
      const res = await axios.post(`${url}/items/project-items`, item);
      const updated = [...items];
      updated[index] = res.data;
      setItems(updated);
      setMatrix(updated)

      toast.success("Item added!");
    } catch (err) {
      alert("Failed to add item.");
      console.error(err);
    } finally {
      setButtonClicked(false);
    }
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        itemName: "",
        quantity: "",
        expectedDeliveryDate: "",
        expectedArrivalDate: "",
        status: "Pending",
        projectId,
      },
    ]);
  };
  const [matrix, setMatrix] = useState()
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${url}/items/${projectId}/`);
        setItems(res.data);
        setMatrix(res.data)
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [projectId]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [projectRes, usersRes] = await Promise.all([
          axios.get(`${url}/projects/${projectId}`),
          axios.get(`${url}/auth/getAllUsers`),
        ]);

        const fetchedProject = projectRes.data;
        const fetchedUsers = usersRes.data;

        fetchedProject.assignedTeamRoles = Array.isArray(
          fetchedProject.assignedTeamRoles
        )
          ? fetchedProject.assignedTeamRoles
          : JSON.parse(fetchedProject.assignedTeamRoles || "[]");

        fetchedProject.proposals = Array.isArray(fetchedProject.proposals)
          ? fetchedProject.proposals
          : JSON.parse(fetchedProject.proposals || "[]");

        fetchedProject.floorPlans = Array.isArray(fetchedProject.floorPlans)
          ? fetchedProject.floorPlans
          : JSON.parse(fetchedProject.floorPlans || "[]");

        fetchedProject.otherDocuments = Array.isArray(
          fetchedProject.otherDocuments
        )
          ? fetchedProject.otherDocuments
          : JSON.parse(fetchedProject.otherDocuments || "[]");
        fetchedProject.invoice = Array.isArray(fetchedProject.invoice)
          ? fetchedProject.invoice
          : JSON.parse(fetchedProject.invoice || "[]");
        fetchedProject.cad = Array.isArray(fetchedProject.cad)
          ? fetchedProject.cad
          : JSON.parse(fetchedProject.cad || "[]");
        fetchedProject.salesAggrement = Array.isArray(
          fetchedProject.salesAggrement
        )
          ? fetchedProject.salesAggrement
          : JSON.parse(fetchedProject.salesAggrement || "[]");
        fetchedProject.presentation = Array.isArray(fetchedProject.presentation)
          ? fetchedProject.presentation
          : JSON.parse(fetchedProject.presentation || "[]");

        fetchedProject.acknowledgements = Array.isArray(
          fetchedProject.acknowledgements
        )
          ? fetchedProject.acknowledgements
          : JSON.parse(fetchedProject.acknowledgements || "[]");
        fetchedProject.receivingReports = Array.isArray(
          fetchedProject.receivingReports
        )
          ? fetchedProject.receivingReports
          : JSON.parse(fetchedProject.receivingReports || "[]");

        setInvoiceFiles(fetchedProject.invoice);

        setProject(fetchedProject);
        setAllUsers(fetchedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project details", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  console.log({ project });
  if (loading) {
    return (
      <Layout>
        <div className="project-details-header">
          <h1>Project Details</h1>
        </div>
        <div className="loading">
          <Loader />
        </div>
      </Layout>
    );
  }
  const removeRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setMatrix((prev) => prev.filter((_, i) => i !== index))
  };
  const handleFileUpload = (e, category) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => ({
      ...prev,
      [category]: [...prev[category], ...files],
    }));
  };
  const removeSelectedFile = (category, index) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const uploadSelectedFiles = async (category) => {
    if (!selectedFiles[category].length) return;

    const formData = new FormData();
    selectedFiles[category].forEach((file) => formData.append("files", file));
    formData.append("category", category);

    try {
      setLoadingDoc(true);
      await axios
        .post(
          `${url}/projects/${projectId}/upload-files?category=${category}`,
          formData
        )
        .then((res) => {
          if (res) {
            setLoadingDoc(false);
          }
        });

      // Clear selected files
      setSelectedFiles((prev) => ({ ...prev, [category]: [] }));

      // Refresh project data
      const res = await axios.get(`${url}/projects/${projectId}`);
      setProject(res.data);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed.");
      setLoadingDoc(false);
    }
  };

  const parseSafeArray = (value) => {
    if (Array.isArray(value)) return value;
    try {
      return JSON.parse(value) || [];
    } catch {
      return [];
    }
  };

  const handleProjectFileUpdate = async (filePath, category) => {
    const existingFiles = parseSafeArray(project[category]);

    const updatedCategoryFiles = existingFiles.filter((f) => f !== filePath);
    const updatedProject = {
      ...project,
      [category]: updatedCategoryFiles,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("removedFiles", JSON.stringify([filePath]));

    // Append required fields
    [
      "name",
      "type",
      "clientName",
      "description",
      "startDate",
      "estimatedCompletion",
      "totalValue",
      "deliveryAddress",
      "deliveryHours",
    ].forEach((key) => {
      if (updatedProject[key] !== undefined) {
        formDataToSend.append(key, updatedProject[key]);
      }
    });

    try {
      const res = await fetch(`${url}/projects/${projectId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (res.status === 200) {
        setProject((prev) => ({
          ...prev,
          [category]: updatedCategoryFiles,
        }));
        toast.success("File removed and project updated!");
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to update project.");
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Error while updating project.");
    }
  };

  const toggleEditRow = (index) => {
    setEditableRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handlePunchStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${url}/punch-list/${id}/status`, { status });
      toast.success("Punch List status updated!");

      // Refresh punch list after update
      const res = await axios.get(`${url}/projects/${projectId}/punch-list`);
      const parsed = res.data.map((issue) => ({
        ...issue,
        productImages:
          typeof issue.productImages === "string"
            ? JSON.parse(issue.productImages)
            : Array.isArray(issue.productImages)
              ? issue.productImages
              : [],
      }));
      setPunchList(parsed);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update punch list status.");
    }
  };
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = [...newIssue.productImages, ...files];

    if (totalFiles.length > 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }

    setNewIssue((prev) => ({
      ...prev,
      productImages: totalFiles,
    }));
  };
  const removeImage = (index) => {
    setNewIssue((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const tabModules = [
    {
      key: "overview",
      label: "Overview",
      permissionKey: null,
      alwaysVisible: true,
    },
    { key: "documents", label: "Documents", permissionKey: "ProjectDocument" },
    { key: "team", label: "Team", permissionKey: "AssignedTeamComments" },
    {
      key: "leadTimeMatrix",
      label: "Lead Time Matrix",
      permissionKey: null,
      alwaysVisible: true,
    },
    { key: "punchlist", label: "Punch List", permissionKey: "PunchList" },
    { key: "invoice", label: "Invoice", permissionKey: "Invoicing" },
    // { key: "settings", label: "Settings", permissionKey: null, alwaysVisible: true  },
  ];
  // notifyTOCustomer
  const handleToNotifyCustomer = async () => {
    const data = { projectId };

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to notify the customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Notify!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setNotifyCustomerLoading(true);
          const response = await axios.post(
            `${url}/notifyCustomerOfItemStatus`,
            data
          );
          console.log(response);
          setNotifyCustomerLoading(false);
          await Swal.fire({
            title: "Success!",
            text: "Customer has been notified successfully.",
            icon: "success",
            timer: 2000, // 3 seconds
            showConfirmButton: false,
          });
        } catch (error) {
          console.error(error);
          setNotifyCustomerLoading(false);
          Swal.fire("Error!", "Something went wrong while notifying.", "error");
        }
      }
    });
  };
  return (
    <Layout>
      <ToastContainer />
      <div className="project-details-page">
        <BackButton />
        <div className="project-details-header">
          <h1>{project.name}</h1>
          <p className="project-subtitle">{project.type} Project</p>
        </div>

        {loadingDoc ? (
          <div className="doc-loader">
            <Loader />
          </div>
        ) : (
          <>
            <div className="tabs">
              {tabModules.map(
                ({ key, label, permissionKey, alwaysVisible }) => {
                  const hasPermission =
                    alwaysVisible || // Show if marked alwaysVisible
                    (permissionKey && rolePermissions?.[permissionKey]?.view);
                  return hasPermission ? (
                    <button
                      key={key}
                      className={activeTab === key ? "tab active" : "tab"}
                      onClick={() => setActiveTab(key)}
                    >
                      {label}
                    </button>
                  ) : null; // Hide tab if not allowed
                }
              )}
            </div>

            <div className="tab-content">
              {activeTab === "overview" && (
                <div className="project-details-container">
                  <div className="project-info-card">
                    <h2>Project Overview</h2>
                    <div className="info-group">
                      <strong>Client:</strong> {project.clientName}
                    </div>
                    <div className="info-group">
                      <strong>Status:</strong> {project.status}
                    </div>
                    <div className="info-group">
                      <strong>Type:</strong> {project.type}
                    </div>
                    <div className="info-group">
                      <strong>Description:</strong>{" "}
                      {project.description || "N/A"}
                    </div>

                    <div className="info-group">
                      <strong>Estimated Occupancy Date:</strong>{" "}
                      {parseInt(project.estimatedCompletion)} Weeks
                    </div>
                    <div className="info-group">
                      <strong>Total Value:</strong> ${" "}
                      {project.totalValue?.toLocaleString() || "N/A"}
                    </div>
                    <div className="info-group">
                      <strong>Advance Payment:</strong> ${" "}
                      {project.advancePayment?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                  <div className="project-info-card">
                    <h2>Delivery Details</h2>
                    <div className="info-group">
                      <strong>Address:</strong>{" "}
                      {project.deliveryAddress || "N/A"}
                    </div>
                    <div className="info-group">
                      <strong>Hours:</strong> {project.deliveryHours || "N/A"}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "documents" && (
                <div className="project-info-card">
                  <div className="tabs-container">
                    <div className="tabs-header">
                      <button
                        className={`tab-button ${activeTabing === "Admin" ? "active" : ""
                          }`}
                        onClick={() => setActiveTabing("Admin")}
                      >
                        BHOUSE
                      </button>
                      <button
                        className={`tab-button ${activeTabing === "Customer" ? "active" : ""
                          }`}
                        onClick={() => setActiveTabing("Customer")}
                      >
                        Customer
                      </button>
                    </div>
                  </div>
                  <div className="tab-content">
                    {activeTabing === "Admin" && (
                      <div className="tab-panel">
                        <h2>Uploaded Documents</h2>

                        {[
                          {
                            title: "Detailed Proposal",
                            files: project.proposals,
                            category: "proposals",
                          },
                          {
                            title: "Floor Plans",
                            files: project.floorPlans,
                            category: "floorPlans",
                          },
                          {
                            title: "Product Maintenance",
                            files: project.otherDocuments,
                            category: "otherDocuments",
                          },
                          {
                            title: "Cad Files",
                            files: project.cad,
                            category: "cad",
                          },
                          {
                            title: "Options Presentation",
                            files: project.presentation,
                            category: "presentation",
                          },
                          {
                            title: "Sales Agreement",
                            files: project.salesAggrement,
                            category: "salesAggrement",
                          },
                          {
                            title: "Acknowledgements",
                            files: project.acknowledgements,
                            category: "acknowledgements",
                          },
                          {
                            title: "Receiving Reports",
                            files: project.receivingReports,
                            category: "receivingReports",
                          },
                        ].map((docCategory, idx) => (
                          <div key={idx} className="  -section">
                            <h3>{docCategory.title}</h3>
                            {rolePermissions?.ProjectDocument?.add ? (
                              <input
                                type="file"
                                multiple
                                accept={docCategory.category === "cad" ? ".pdf" : "*/*"}
                                onChange={(e) =>
                                  handleFileUpload(e, docCategory.category)
                                }
                              />
                            ) : null}

                            {selectedFiles[docCategory.category]?.length >
                              0 && (
                                <div className="file-preview-section">
                                  <h4>Files to be uploaded:</h4>
                                  <ul className="preview-list">
                                    {selectedFiles[docCategory.category].map(
                                      (file, i) => (
                                        <li key={i} className="preview-item">
                                          {file.name}

                                          <span
                                            className="remove-preview"
                                            onClick={() =>
                                              removeSelectedFile(
                                                docCategory.category,
                                                i
                                              )
                                            }
                                          >
                                            ×
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                  <button
                                    className="upload-btn"
                                    onClick={() =>
                                      uploadSelectedFiles(docCategory.category)
                                    }
                                  >
                                    Upload
                                  </button>
                                </div>
                              )}
                            {(() => {
                              const files = Array.isArray(docCategory?.files)
                                ? docCategory.files
                                : typeof docCategory.files === "string"
                                  ? JSON.parse(docCategory.files)
                                  : [];

                              return files.length > 0 ? (
                                <div className="uploaded-files">
                                  {files.map((filePath, idx) => {
                                    const fileName = filePath.split("/").pop();
                                    const fileUrl = filePath.startsWith(
                                      "uploads"
                                    )
                                      ? `${url2}/${filePath}`
                                      : filePath;

                                    const handleDownload = async () => {
                                      try {
                                        const response = await fetch(fileUrl);
                                        const blob = await response.blob();
                                        const downloadUrl =
                                          window.URL.createObjectURL(blob);
                                        const link =
                                          document.createElement("a");
                                        link.href = downloadUrl;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(downloadUrl);
                                      } catch (error) {
                                        console.error("Download failed", error);
                                        alert(
                                          "Download failed, please try again."
                                        );
                                      }
                                    };

                                    return (
                                      <div
                                        key={idx}
                                        className="file-item-enhanced"
                                      >
                                        <span className="file-name-enhanced">
                                          {fileName}
                                        </span>
                                        <div className="file-actions">
                                          <button
                                            className="file-action-btn"
                                            onClick={() =>
                                              window.open(fileUrl, "_blank")
                                            }
                                            title="View"
                                          >
                                            <FaEye />
                                          </button>
                                          <button
                                            className="file-action-btn"
                                            onClick={handleDownload}
                                            title="Download"
                                          >
                                            <FaDownload />
                                          </button>
                                          <button
                                            className="file-action-btn"
                                            title="Delete"
                                            onClick={() => {
                                              Swal.fire({
                                                title: "Are you sure?",
                                                text: "Do you want to remove this file?",
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonText:
                                                  "Yes, remove it!",
                                                cancelButtonText: "Cancel",
                                              }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                  await handleProjectFileUpdate(
                                                    filePath,
                                                    docCategory.category
                                                  );
                                                }
                                              });
                                            }}
                                          >
                                            <MdDelete />
                                          </button>
                                          <button
                                            className="file-action-btn"
                                            title="Comment"
                                            onClick={() =>
                                              navigate(
                                                `/project/${projectId}/file-comments`,
                                                {
                                                  state: {
                                                    filePath,
                                                    category:
                                                      docCategory.category,
                                                  },
                                                }
                                              )
                                            }
                                          >
                                            <FaComment />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p>No documents uploaded.</p>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTabing === "Customer" && (
                      <div className="tab-panel">
                        <h2>Uploaded Documents</h2>

                        {Object.keys(docMap).map((key, idx) => {
                          const normalizedKey = normalize(key);
                          const fileEntry = Object.entries(docsData).find(
                            ([docType]) => normalize(docType) === normalizedKey
                          );
                          const filePath = fileEntry?.[1];
                          const fileName = filePath?.split("/").pop();
                          const fileUrl = filePath?.startsWith("uploads")
                            ? `${url2}/${filePath}`
                            : filePath;
                          const matchedDoc = dataDoc?.find(
                            (doc) =>
                              normalize(doc.documentType) === normalizedKey
                          );
                          const documentId = matchedDoc?.id;
                          return (
                            <div key={idx} className="doc-view-section">
                              <h4>{docMap[key]}</h4>
                              {filePath ? (
                                <div className="file-item-enhanced">
                                  <span className="file-name-enhanced">
                                    {fileName}
                                  </span>
                                  <button
                                    className="file-action-btn"
                                    onClick={() =>
                                      window.open(`${fileUrl}`, "_blank")
                                    }
                                    title="View"
                                  >
                                    <FaEye />
                                  </button>
                                  <button
                                    className="file-action-btn"
                                    onClick={() =>
                                      navigate(
                                        `/customerDoc/comment/${fileEntry[0]}/${documentId}`,
                                        {
                                          state: {
                                            data: dataDoc,
                                            fileName: fileEntry[0],
                                          },
                                        }
                                      )
                                    }
                                    title="View"
                                  >
                                    <FaComment />
                                  </button>
                                </div>
                              ) : (
                                <p>No document uploaded.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="project-info-card">
                  <h2>Assigned Team</h2>
                  {project.assignedTeamRoles.length > 0 ? (
                    <div className="team-grid">
                      {project.assignedTeamRoles.map((roleGroup, index) => (
                        <div key={index} className="role-card">
                          <h3 className="role-title">{roleGroup.role}</h3>
                          {roleGroup.users.map((userId) => {
                            const user = allUsers.find(
                              (u) => u.id.toString() === userId.toString()
                            );
                            return user ? (
                              <div
                                key={user.id}
                                className="user-card-horizontal"
                              >
                                <img
                                  src={
                                    user.profileImage
                                      ? `${url2}/${user.profileImage}`
                                      : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
                                  }
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="user-profile-img-horizontal"
                                />
                                <div className="user-info-horizontal">
                                  <span className="user-name-horizontal">
                                    {user.firstName} {user.lastName}
                                  </span>
                                  <button
                                    className="comment-btna"
                                    onClick={() => handleOpenComments(user)}
                                  >
                                    <FaCommentAlt />
                                  </button>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No team assigned.</p>
                  )}
                </div>
              )}

              {activeTab === "leadTimeMatrix" && (
                <div className="project-info-card">
                  <div className="leadtimematrixheading">
                    <h2>Project Lead Time Matrix</h2>

                    {matrix.length > 0 ?
                      <button className="leadtimematrixheadingbutton" disabled={notifyCustomerLoading} onClick={() => handleToNotifyCustomer()}>{notifyCustomerLoading ? <>Notify customer <SpinnerLoader size={10} /></> : "Notify customer"}</button>
                      : null}


                  </div>
                  <table className="matrix-table">
                    {items.length > 0 ?
                      <thead>
                        <tr>
                          <th>Manufacturer Name</th>
                          <th>Description</th>
                          <th>TBD</th>
                          <th>Expected Departure</th>
                          <th>Expected Arrival</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      : null}


                    <tbody>
                      {items.map((item, index) => {
                        const isEditable = editableRows[index] || !item.id;

                        const handleSave = () => {
                          console.log(buttonClicked, "button clic");

                          if (
                            !item.itemName ||
                            !item.quantity ||
                            (!item.tbd &&
                              (!item.expectedDeliveryDate ||
                                !item.expectedArrivalDate)) ||
                            !item.status
                          ) {
                            return toast.error(
                              "All required fields must be filled."
                            );
                          }

                          if (!/^[a-zA-Z\s]*$/.test(item.itemName)) {
                            return toast.error(
                              "Item Name must contain only letters."
                            );
                          }

                          if (item.id) {
                            updateItem(item);
                          } else {
                            addNewItemToBackend(item, index);
                          }

                          // ✅ After saving, disable the row
                          setEditableRows((prev) => ({
                            ...prev,
                            [index]: false,
                          }));
                        };

                        return (
                          <tr key={item.id || index}>
                            <td>
                              <input
                                style={{
                                  height: "30px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                }}
                                value={item.itemName}
                                disabled={!isEditable}
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
                              <textarea
                                type="text"
                                value={item.quantity}
                                disabled={!isEditable}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className="item-description-input"
                                maxLength={50}
                                style={{
                                  height: "30px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                }}
                              />
                            </td>
                            <td>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={item.tbd || false}
                                  disabled={!isEditable}
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
                                TBD
                              </label>
                            </td>

                            <td>
                              <input
                                type="date"
                                style={{
                                  height: "30px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                }}
                                value={
                                  item.expectedDeliveryDate?.slice(0, 10) || ""
                                }
                                min={new Date().toISOString().split("T")[0]}
                                disabled={item.tbd || !isEditable}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "expectedDeliveryDate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="date"
                                style={{
                                  height: "30px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                }}
                                value={
                                  item.expectedArrivalDate?.slice(0, 10) || ""
                                }
                                min={new Date().toISOString().split("T")[0]}
                                disabled={item.tbd || !isEditable}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "expectedArrivalDate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <select
                                value={item.status}
                                disabled={!isEditable}
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
                                isEditable ? (
                                  <button
                                    disabled={buttonClicked ? true : false}
                                  >
                                    {" "}
                                    {buttonClicked ? (
                                      "..."
                                    ) : (
                                      <span onClick={handleSave}>Save</span>
                                    )}
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => toggleEditRow(index)}
                                    >
                                      <MdEdit />
                                    </button>
                                    <button onClick={() => deleteItem(item.id)}>
                                      <MdDelete />
                                    </button>
                                    <button
                                      onClick={() => openItemComment(item.id)}
                                      title="Comment"
                                    >
                                      <FaCommentAlt />
                                    </button>
                                  </>
                                )
                              ) : (
                                <>
                                  <button
                                    disabled={buttonClicked ? true : false}
                                  >
                                    {" "}
                                    {buttonClicked ? (
                                      "Saving"
                                    ) : (
                                      <span onClick={handleSave}>Save</span>
                                    )}
                                  </button>
                                  <button onClick={() => removeRow(index)}>
                                    Remove
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div
                    className="button1"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <button className="ledbutton" onClick={handleAddItemRow}>
                      + Add Row
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "punchlist" && (
                <div className="project-info-card">
                  <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                    <button
                      className="ledbutton"
                      onClick={() => setShowPunchModal(true)}
                    >
                      + Add
                    </button>
                  </div>
                  {showPunchModal && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <h3>Add Punch List Issue</h3>
                        <label>Manufacturer</label>
                        <select
                          value={newIssue.projectItemId}
                          onChange={(e) =>
                            setNewIssue({
                              ...newIssue,
                              projectItemId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select</option>
                          {projectItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.itemName}
                            </option>
                          ))}
                        </select>
                        <label>Title</label>
                        <input
                          value={newIssue.title}
                          onChange={(e) =>
                            setNewIssue({ ...newIssue, title: e.target.value })
                          }
                          maxLength={30}
                        />

                        <label>Description</label>
                        <textarea
                          value={newIssue.issueDescription}
                          onChange={(e) =>
                            setNewIssue({
                              ...newIssue,
                              issueDescription: e.target.value,
                            })
                          }
                          minLength={50}
                          maxLength={200}
                        />

                        <label>Upload Files</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                        {newIssue.productImages.length > 0 && (
                          <div className="image-preview-grid">
                            {newIssue.productImages.map((img, index) => {
                              const imageUrl =
                                typeof img === "string"
                                  ? img
                                  : URL.createObjectURL(img);

                              return (
                                <div key={index} className="preview-wrapper">
                                  <img
                                    src={imageUrl}
                                    alt={`preview-${index}`}
                                    className="preview-img"
                                  />
                                  <span
                                    className="remove-btn"
                                    onClick={() => removeImage(index)}
                                  >
                                    ×
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="modal-actions">
                          <button
                            className="submit-btn"
                            onClick={async () => {
                              try {
                                setPunchListLoading(true);
                                const formData = new FormData();
                                const stored = JSON.parse(
                                  localStorage.getItem("user")
                                );

                                const storedUser = stored?.user;
                                const storedCustomer = JSON.parse(
                                  localStorage.getItem("customer")
                                );

                                let createdById = "";
                                let createdByType = "";

                                if (storedUser?.id) {
                                  createdById = storedUser.id;
                                  createdByType = "user";
                                } else if (storedCustomer?.id) {
                                  createdById = storedCustomer.id;
                                  createdByType = "customer";
                                } else {
                                  toast.error("User not logged in");
                                  setPunchListLoading(false);
                                  return;
                                }

                                formData.append("createdById", createdById);
                                formData.append("createdByType", createdByType);
                                formData.append("title", newIssue.title);
                                formData.append(
                                  "issueDescription",
                                  newIssue.issueDescription
                                );
                                formData.append(
                                  "projectItemId",
                                  newIssue.projectItemId
                                );
                                formData.append("projectId", projectId);
                                formData.append(
                                  "category",
                                  projectItems.find(
                                    (p) => p.id == newIssue.projectItemId
                                  )?.itemName || ""
                                );

                                for (let file of newIssue.productImages) {
                                  formData.append("productImages", file);
                                }

                                await axios.post(
                                  `${url}/projects/${projectId}/punch-list`,
                                  formData
                                );
                                toast.success("Issue added!");
                                setShowPunchModal(false);
                                setNewIssue({
                                  title: "",
                                  issueDescription: "",
                                  projectItemId: "",
                                  productImages: [],
                                });

                                const res = await axios.get(
                                  `${url}/projects/${projectId}/punch-list`
                                );
                                setPunchList(
                                  res.data.map((issue) => ({
                                    ...issue,
                                    productImages:
                                      typeof issue.productImages === "string"
                                        ? JSON.parse(issue.productImages)
                                        : issue.productImages,
                                  }))
                                );
                              } catch (err) {
                                console.error("Failed to add issue", err);
                                toast.error("Error adding issue");
                              } finally {
                                setPunchListLoading(false);
                              }
                            }}
                            disabled={punchListLoading}
                          >
                            {punchListLoading ? <SpinnerLoader /> : "Submit"}
                          </button>

                          <button
                            className="cancel-btn"
                            onClick={() => setShowPunchModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <h2>Punch List</h2>

                  {punchList.length === 0 ? (
                    <p>No punch list issues found.</p>
                  ) : (
                    <div className="punch-list-grid compact-style">
                      {punchList.map((issue, idx) => {
                        const files = Array.isArray(issue.productImages)
                          ? issue.productImages
                          : [];
                        const currentStatus = statusMap[issue.id] || "Pending";

                        return (
                          <div
                            className="punch-card-small"
                            key={issue.id || idx}
                          >
                            <div className="punch-card-top">
                              <h4>{issue.title}</h4>
                              <span
                                className={`status-badge ${issue.status?.toLowerCase() || "pending"
                                  }`}
                              >
                                {issue.status || "Pending"}
                              </span>
                            </div>

                            <div className="punch-mini-info">
                              <p>
                                <strong>Manufacturer:</strong>{" "}
                                {issue.item?.itemName || "N/A"}
                              </p>
                              <p>
                                <strong>Description:</strong>{" "}
                                {issue.issueDescription}
                              </p>
                            </div>

                            {/* Status Dropdown + Update Button */}
                            <div className="status-control">
                              <select
                                className="status-dropdown"
                                value={currentStatus}
                                onChange={(e) =>
                                  setStatusMap((prev) => ({
                                    ...prev,
                                    [issue.id]: e.target.value,
                                  }))
                                }
                              >
                                <option value="Pending">Pending</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              <button
                                className="update-status-btn"
                                onClick={() =>
                                  handlePunchStatusUpdate(
                                    issue.id,
                                    currentStatus
                                  )
                                }
                              >
                                Save
                              </button>
                            </div>

                            {/* Attachments */}
                            {files.length > 0 && (
                              <div className="punch-attachments">
                                {files.map((file, i) => {
                                  const isPDF = file
                                    .toLowerCase()
                                    .endsWith(".pdf");
                                  const fileUrl = `${url2}/${file}`;
                                  return (
                                    <div
                                      key={i}
                                      className="punch-attachment-preview"
                                    >
                                      {isPDF ? (
                                        <iframe
                                          src={fileUrl}
                                          title={`PDF-${i}`}
                                          className="file-mini-pdf"
                                        />
                                      ) : (
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <img
                                            src={fileUrl}
                                            alt={`Img-${i}`}
                                            className="file-mini-img"
                                          />
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <p>
                              <strong>Created At:</strong>{" "}
                              {new Date(issue.createdAt).toLocaleString()}
                            </p>

                            <p>
                              <strong>Created By:</strong>{" "}
                              {issue.createdByType === "user"
                                ? `${issue.creatorUser?.firstName || ""} ${issue.creatorUser?.lastName || ""
                                }`
                                : issue.creatorCustomer?.full_name || "N/A"}
                            </p>
                            <button
                              className="comment-btna"
                              onClick={() => openPunchComment(issue.id)}
                              title="Comment"
                            >
                              <FaCommentAlt />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "invoice" && (
                <InvoiceManagement projectId={projectId} />
              )}

              {activeTab === "settings" && (
                <div className="project-info-card">
                  <h2>Settings</h2>
                  <div className="info-group">
                    <strong>Client View:</strong>{" "}
                    {project.allowClientView ? "Allowed" : "Disabled"}
                  </div>
                  <div className="info-group">
                    <strong>Comments:</strong>{" "}
                    {project.allowComments ? "Allowed" : "Disabled"}
                  </div>
                  <div className="info-group">
                    <strong>Email Notifications:</strong>{" "}
                    {project.enableNotifications ? "Allowed" : "Disabled"}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/*team comment canvas*/}
      <Offcanvas
        isOpen={isOffcanvasOpen}
        closeOffcanvas={closeOffcanvas}
        getLatestComment={fetchComments}
      >
        <div className="right-panel">
          <div
            className="comments-list"
            style={{
              maxHeight: "500px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Grouped Comments by Date */}
            {Object.keys(groupedComments)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <div key={date} className="comment-date-group">
                  <p className="comment-date">{date}</p>
                  {groupedComments[date]
                    .sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    ) // Oldest to newest in each group
                    .map((comment) => (
                      <div key={comment.id}>
                        <div className="whatsapp-comment-box">
                          <div className="whatsapp-comment-user-info">
                            <img
                              src={
                                comment?.profileImage
                                  ? `${url2}/${comment.profileImage}`
                                  : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
                              }
                              alt="User"
                              className="whatsapp-comment-user-avatar"
                            />
                            <div>
                              <p className="whatsapp-comment-author">
                                {comment?.name} ({comment?.userRole})
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
                  <div ref={scrollRef} />
                </div>
              ))}
          </div>
        </div>

        <div className="whatsapp-comment-form">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="whatsapp-comment-input"
            placeholder="Write your comment..."
          />
          <button
            onClick={commentLoading ? null : handleAddComment}
            className="whatsapp-submit-btn"
          >
            {commentLoading ? <SpinnerLoader size={10} /> : <FaTelegramPlane />}
          </button>
        </div>
      </Offcanvas>
      {/*item comment canvas*/}
      <Offcanvas
        isOpen={isItemCanvasOpen}
        closeOffcanvas={() => setIsItemCanvasOpen(false)}
        getLatestComment={() => openItemComment(selectedItemId)}
      >
        <div className="right-panel">
          <div
            className="comments-list"
            style={{
              maxHeight: "500px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {Object.keys(groupedItemComments)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <div key={date} className="comment-date-group">
                  <p className="comment-date">{date}</p>
                  {groupedItemComments[date]
                    .sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    )
                    .map((comment) => (
                      <div key={comment.id} className="whatsapp-comment-box">
                        <div className="whatsapp-comment-user-info">
                          <img
                            src={
                              comment.profileImage
                                ? `${url2}/${comment.profileImage}`
                                : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
                            }
                            alt="User"
                            className="whatsapp-comment-user-avatar"
                          />
                          <div>
                            <p className="whatsapp-comment-author">
                              {comment?.createdByName && comment?.userRole
                                ? `${comment.createdByName} (${comment.userRole})`
                                : "Customer"}
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
                    ))}
                  <div ref={scrollRef} />
                </div>
              ))}
          </div>
        </div>

        <div className="whatsapp-comment-form">
          <textarea
            value={itemCommentText}
            onChange={(e) => setItemCommentText(e.target.value)}
            className="whatsapp-comment-input"
            placeholder="Write your comment..."
          />
          <button
            onClick={commentLoading ? null : handleAddItemComment}
            className="whatsapp-submit-btn"
          >
            {commentLoading ? <SpinnerLoader size={10} /> : <FaTelegramPlane />}
          </button>
        </div>
      </Offcanvas>
      {/*punch comment canvas*/}
      <Offcanvas
        isOpen={isPunchCanvasOpen}
        closeOffcanvas={() => setIsPunchCanvasOpen(false)}
        getLatestComment={() => openPunchComment(selectedPunchItemId)}
      >
        <div className="right-panel">
          <div
            className="comments-list"
            style={{
              maxHeight: "500px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {Object.keys(groupedPunchComments)
              .sort((a, b) => new Date(a) - new Date(b)) // Oldest date group first
              .map((date) => (
                <div key={date} className="comment-date-group">
                  <p className="comment-date">{date}</p>

                  {groupedPunchComments[date]
                    .sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    ) // Oldest to newest inside each group
                    .map((comment) => {
                      const isUser = !!comment.user;
                      const creator = isUser ? comment.user : comment.customer;

                      return (
                        <div key={comment.id} className="whatsapp-comment-box">
                          <div className="whatsapp-comment-user-info">
                            <img
                              src={
                                comment.profileImage
                                  ? `${url2}/${comment.profileImage}`
                                  : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
                              }
                              alt="User"
                              className="whatsapp-comment-user-avatar"
                            />
                            <div>
                              <p className="whatsapp-comment-author">
                                {comment.createdByType === "user"
                                  ? `${comment.name} (${comment.userRole})`
                                  : `Customer`}
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
                      );
                    })}

                  {/* Scroll to latest (last) comment */}
                  <div ref={scrollRef} />
                </div>
              ))}
          </div>
        </div>

        <div className="whatsapp-comment-form">
          <textarea
            value={punchCommentText}
            onChange={(e) => setPunchCommentText(e.target.value)}
            className="whatsapp-comment-input"
            placeholder="Write your comment..."
          />
          <button
            onClick={commentLoading ? null : handleAddPunchComment}
            className="whatsapp-submit-btn"
          >
            {commentLoading ? <SpinnerLoader size={10} /> : <FaTelegramPlane />}
          </button>
        </div>
      </Offcanvas>
    </Layout>
  );
};

export default ProjectDetails;
