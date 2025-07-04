import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaDownload, FaTrashAlt, FaEdit } from "react-icons/fa";
import { MdSave } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import { url, url2 } from "../../lib/api";
import "../../styles/Projects/InvoiceManagement.css";
import { FaEye } from "react-icons/fa";
import SpinnerLoader from "../../components/SpinnerLoader";
import { useRef } from "react";
const InvoiceManagement = ({ projectId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showUpdateInvoiceModal, setShowUpdateInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    totalAmount: "",
    advancePaid: 0,
    status: "Pending",
    invoiceFile: null,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    totalValue: 0,
    advancePayment: 0,
  });
  const fileInputRef = useRef(null); // for clearing input programmatically
  // Fetch invoices for the project
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const projectRes = await axios.get(`${url}/projects/${projectId}`);
        setProjectDetails({
          totalValue: Number(projectRes.data.totalValue || 0),
          advancePayment: Number(projectRes.data.advancePayment || 0),
        });

        const response = await axios.get(
          `${url}/projects/${projectId}/invoice`
        );
        const invoicesData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setInvoices(invoicesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching invoices or project:", err);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [projectId]);
  const getPaidAmount = () => {
    const paidFromInvoices = invoices.reduce((sum, invoice) => {
      if (invoice.status === "Paid") {
        return sum + Number(invoice.totalAmount || 0);
      } else {
        return sum + Number(invoice.advancePaid || 0);
      }
    }, 0);

    return Number(projectDetails.advancePayment || 0) + paidFromInvoices;
  };

  const getBalance = () => {
    const invoiceTotal = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    );
    const totalProjectCost = Math.max(
      Number(projectDetails.totalValue || 0),
      invoiceTotal
    );
    const paid = getPaidAmount();
    return totalProjectCost - paid;
  };

  // Open modal for adding a new invoice
  const handleAddInvoice = () => {
    setShowAddInvoiceModal(true);
    setInvoiceData({
      totalAmount: "",
      advancePaid: 0,
      status: "Pending",
      invoiceFile: null,
    });
  };

  // Open modal for editing an invoice
  const handleOpenUpdateInvoiceModal = (invoice) => {
    console.log(invoice, "invoice")
    setInvoiceData({
      totalAmount: invoice.totalAmount,
      advancePaid: invoice.advancePaid,
      status: invoice.status,
      description: invoice.description,
      invoiceFile: invoice.invoiceFilePath
      ,
    });
    setSelectedInvoice(invoice);
    setShowUpdateInvoiceModal(true);
  };

  // Handle input changes in the invoice modal
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prevState) => ({ ...prevState, [name]: value }));
  };
  // Handle file change (for invoice file upload)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedPdfType = "application/pdf";

    if (allowedImageTypes.includes(fileType)) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewURL(imageUrl);
      setIsPdf(false);
      setInvoiceData(prev => ({ ...prev, invoiceFile: file }));
    } else if (fileType === allowedPdfType) {
      const pdfUrl = URL.createObjectURL(file);
      setPreviewURL(pdfUrl);
      setIsPdf(true);
      setInvoiceData(prev => ({ ...prev, invoiceFile: file }));
    } else {
      alert("Only JPG, PNG, WEBP, or PDF files are allowed.");
      e.target.value = "";
      setPreviewURL(null);
      setIsPdf(false);
      setInvoiceData(prev => ({ ...prev, invoiceFile: null }));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewURL(null);
    setInvoiceData({ ...invoiceData, invoiceFile: null });

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // Save the new invoice
  const handleSaveNewInvoice = async () => {
    try {
      setIsLoading(true);
  
      const projectLimit =
        projectDetails.totalValue - projectDetails.advancePayment;
  
      const currentInvoiceTotal = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.totalAmount || 0),
        0
      );
  
      const newInvoiceAmount = Number(invoiceData.totalAmount || 0);
      const updatedTotal = currentInvoiceTotal + newInvoiceAmount;
  
      // Always prevent invoice from exceeding balance due
      if (newInvoiceAmount > getBalance()) {
        Swal.fire({
          icon: "info",
          title: "Exceeds balance due",
          text: "The new invoice amount exceeds the balance due. Please reduce the invoice amount.",
        });
        return;
      }
  
      // Apply original validation only for non-pending status
      if (invoiceData.status !== "Pending") {
        if (updatedTotal > projectLimit) {
          Swal.fire({
            icon: "warning",
            title: "Invoice limit exceeded!",
            text: "Your invoice total value has exceeded the allowed limit. Please update the project value to proceed.",
          });
          return;
        }
      }
  
      const formData = new FormData();
      formData.append("totalAmount", invoiceData.totalAmount);
      formData.append("advancePaid", invoiceData.advancePaid);
      formData.append("status", invoiceData.status);
      formData.append("description", invoiceData.description || "");
  
      if (invoiceData.invoiceFile) {
        formData.append("invoice", invoiceData.invoiceFile);
      }
  
      const response = await axios.post(
        `${url}/projects/${projectId}/invoice`,
        formData
      );
  
      toast.success("Invoice added!");
      setInvoices((prevInvoices) => [...prevInvoices, response.data]);
      setShowAddInvoiceModal(false);
      setIsLoading(false);
      setPreviewURL('');
      setSelectedFile("");
    } catch (err) {
      setIsLoading(false);
      console.error("Error adding invoice:", err);
      toast.error("Error adding invoice.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSaveUpdatedInvoice = async () => {
    try {
      const newInvoiceAmount = Number(invoiceData.totalAmount || 0);
      const currentInvoiceAmount = Number(selectedInvoice.totalAmount || 0);
      const balanceDue = getBalance();
      const maxAllowed = balanceDue + currentInvoiceAmount;
  
      if (newInvoiceAmount > maxAllowed) {
        Swal.fire({
          icon: "warning",
          title: "Amount exceeds allowed limit",
          text: "Your invoice total value has exceeded the allowed limit. Please update the project value to proceed.",
        });
        return;
      }
  
      // Proceed with update
      const formData = new FormData();
      formData.append("totalAmount", invoiceData.totalAmount);
      formData.append("advancePaid", invoiceData.advancePaid);
      formData.append("status", invoiceData.status);
      formData.append("description", invoiceData.description || "");
  
      if (invoiceData.invoiceFile) {
        formData.append("invoice", invoiceData.invoiceFile);
      }
  
      setIsLoading(true);
      const response = await axios.put(
        `${url}/projects/${projectId}/invoice/${selectedInvoice.id}`,
        formData
      );
  
      toast.success("Invoice updated!");
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.id === selectedInvoice.id ? response.data : invoice
        )
      );
      setShowUpdateInvoiceModal(false);
    } catch (err) {
      console.error("Error updating invoice:", err);
      toast.error("Error updating invoice.");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  // Handle deleting an invoice
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await axios.delete(`${url}/projects/${projectId}/invoice/${invoiceId}`);
      toast.success("Invoice deleted!");
      setInvoices((prevInvoices) =>
        prevInvoices.filter((invoice) => invoice.id !== invoiceId)
      ); // Remove the invoice from the list
    } catch (err) {
      console.error("Error deleting invoice:", err);
      toast.error("Error deleting invoice.");
    } finally {
      setIsLoading(false);
    }
  };
  // Open invoice file
  const handleOpenFile = (filePath) => {
    window.open(`${url2}/${filePath}`, "_blank");
  };
  //handleCancel
  const handleCancel = () => {
    setShowAddInvoiceModal(false)
    setPreviewURL('');
    setSelectedFile("");
  }
  const handleUpdateCancel = () => {
    setShowUpdateInvoiceModal(false)
    setPreviewURL('');
    setSelectedFile("");
  }
  if (loading) return <Loader />;
  return (
    <div className="invoice-management-container">
      <div className="project-finance-summary">
        <div className="summary-card">
          <div className="summary-item">
            <p className="label">Total Cost</p>
            <p className="value">
              ${(projectDetails.totalValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="summary-item">
            <p className="label">Paid Amount</p>
            <p className="value">${getPaidAmount().toLocaleString()}</p>
          </div>
          <div className="summary-item">
            <p className="label">
              {getBalance() >= 0 ? "Balance Due" : "Overpaid"}
            </p>
            <p className="value">${Math.abs(getBalance()).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button className="ledbutton" onClick={handleAddInvoice}>
          + Add Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        <table className="invoice-management-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Total Amount</th>
              <th>Advance Paid</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Description</th>

              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={invoice.id}>
                <td>{index + 1}</td>
                <td>{invoice.totalAmount}</td>
                <td>{invoice.advancePaid ?? "-"}</td>
                <td>{invoice.status}</td>
                <td>{new Date(invoice.createdAt).toLocaleString()}</td>

                {/* Description with tooltip on overflow */}
                <td>
                  <div
                    style={{
                      maxWidth: "150px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      cursor: invoice.description ? "pointer" : "default",
                    }}
                    title={invoice.description || "No description"}
                  >
                    {invoice.description || "—"}
                  </div>
                </td>

                {/* Actions */}
                <td>
                  {/* 👁️ View in new tab */}
                  <button
                    onClick={() => {
                      if (invoice.invoiceFilePath) {
                        window.open(
                          `${url2}/${invoice.invoiceFilePath}`,
                          "_blank"
                        );
                      } else {
                        Swal.fire("No file uploaded for this invoice.");
                      }
                    }}
                    title="View file"
                  >
                    <FaEye />
                  </button>

                  {/* ✏️ Edit */}
                  <button
                    onClick={() => handleOpenUpdateInvoiceModal(invoice)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>

                  {/* ⬇️ Download */}
                  <button
                    onClick={async () => {
                      if (!invoice.invoiceFilePath) {
                        Swal.fire("No file to download.");
                        return;
                      }
                      const response = await fetch(
                        `${url2}/${invoice.invoiceFilePath}`
                      );
                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download = invoice.invoiceFilePath.split("/").pop();
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                    title="Download"
                  >
                    <FaDownload />
                  </button>

                  {/* 🗑️ Delete */}
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "Do you want to remove this invoice?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, remove it!",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handleDeleteInvoice(invoice.id);
                        }
                      });
                    }}
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Invoice</h3>

            <label>Total Amount</label>
      <input
  type="text"
  name="totalAmount"
  value={invoiceData.totalAmount}
  onChange={handleInvoiceChange}
  onInput={(e) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      // valid input — allow change
    } else {
      // invalid — remove last character
      e.target.value = invoiceData.totalAmount; // prevent update
    }
  }}
  maxLength={8}
/>


            <label>Status</label>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleInvoiceChange}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partly Paid">Partly Paid</option>
            </select>

            {invoiceData.status === "Partly Paid" && (
              <div>
                <label>Paid Ammount</label>
              <input
  type="text"
  name="advancePaid"
  value={invoiceData.advancePaid}
  onChange={handleInvoiceChange}
  onInput={(e) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,2}$/;
    if (!regex.test(value) && value !== '') {
      e.target.value = invoiceData.advancePaid; // prevent invalid input
    }
  }}
  maxLength={6}
/>

              </div>
            )}
            <label>Description (optional)</label>
            <textarea
              name="description"
              value={invoiceData.description}
              onChange={handleInvoiceChange}
              maxLength={150}
              placeholder="Enter invoice description (max 150 characters)"
              style={{ width: "100%", resize: "vertical", minHeight: "60px" }}
            />

            <label>Invoice File</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} />
            {previewURL && (
              <div style={{ position: "relative", marginTop: "10px", display: "inline-block" }}>
                {isPdf ? (
                  <>
                    <a
                      href={previewURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f5f5f5",
                        textDecoration: "none",
                        color: "#333",
                      }}
                    >
                      View PDF Invoice
                    </a>
                    <button
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "red",
                        color: "white",
                        border: "none",
                        // borderRadius: "50%",
                        cursor: "pointer",
                        width: "20px",
                        height: "20px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <img
                      src={previewURL}
                      alt="Invoice Preview"
                      style={{
                        width: "100%",
                        maxWidth: "150px",
                        height: "auto",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                    <button
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "red",
                        color: "white",
                        border: "none",
                        // borderRadius: "50%",
                        cursor: "pointer",
                        width: "20px",
                        height: "20px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            )}



            <div className="invoice-btn">
              {isLoading ? (
                <button >
                  <SpinnerLoader size="15px" />&nbsp;Save
                </button>

              ) : (
                <button onClick={handleSaveNewInvoice}>
                  <MdSave />
                  Save
                </button>
              )}

              <button onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Invoice Modal */}
      {showUpdateInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Invoice</h3>

            {/* Total Amount */}
            <label>Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={invoiceData.totalAmount}
              onChange={handleInvoiceChange}
              maxLength={6}
            />

            {/* Status */}
            <label>Status</label>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleInvoiceChange}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partly Paid">Partly Paid</option>
            </select>

            {/* Advance Paid if partly */}
            {invoiceData.status === "Partly Paid" && (
              <div>
                <label>Advance Payment</label>
                <input
                  type="number"
                  name="advancePaid"
                  value={invoiceData.advancePaid}
                  onChange={handleInvoiceChange}
                  maxLength={6}
                />
              </div>
            )}

            {/* Description */}
            <label>Description</label>
            <textarea
              name="description"
              value={invoiceData.description || ""}
              onChange={handleInvoiceChange}
              maxLength={150}
              rows={3}
              placeholder="Enter invoice description (optional, max 150 characters)"
            />

            {/* File Upload */}
            <label>Invoice File</label>
            <input type="file" onChange={handleFileChange} />
            {(invoiceData.invoiceFile) && (
              <div
                style={{
                  position: "relative",
                  marginTop: "10px",
                  display: "inline-block",
                  maxWidth: "150px",
                }}
              >
                {(() => {
                  const file = invoiceData.newInvoiceFile || invoiceData.invoiceFile;
                  const isNewFile = file instanceof File;
                  const fileName = isNewFile ? file.name : file;
                  const fileURL = isNewFile ? URL.createObjectURL(file) : `${url2}/${file}`;

                  if (fileName.toLowerCase().endsWith(".pdf")) {
                    return (
                      <>
                        <a
                          href={fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backgroundColor: "#f5f5f5",
                            textDecoration: "none",
                            color: "#333",
                          }}
                        >
                          View PDF Invoice
                        </a>

                      </>
                    );
                  } else {
                    return (
                      <>
                        <img
                          src={fileURL}
                          alt="Invoice Preview"
                          style={{ maxWidth: "100px", height: "auto" }}
                        />

                      </>
                    );
                  }
                })()}
              </div>
            )}
            {/* Action Buttons */}
            <div className="invoice-btn">
              {isLoading ? (
                <button >
                  <SpinnerLoader size="15px" />&nbsp;
                  Save
                </button>

              ) : (
                <button onClick={handleSaveUpdatedInvoice}>
                  <MdSave />
                  Save
                </button>
              )}
              <button
                onClick={handleUpdateCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
