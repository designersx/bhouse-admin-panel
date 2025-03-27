import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import { getCustomerById, uploadDocument, getDocumentsByCustomer, getCommentsByDocument, addComment, url } from "../../lib/api"; 
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { url2 } from "../../lib/api";
import "./style.css"; // Importing custom styles
import CustomerProjects from "../../components/CustomerProjects";

function ViewCustomer() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                let res = await getCustomerById(id);
                setCustomer(res);
            } catch (error) {
                console.error("Error fetching customer:", error);
            }
        };

        const fetchDocs = async () => {
            try {
                const docs = await getDocumentsByCustomer(id);
                setDocuments(docs);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        fetchCustomer();
        fetchDocs();
    }, [id]);

    // ✅ Toggle comments on click (Fetch & Toggle)
    const toggleComments = async (documentId) => {
        if (showComments[documentId]) {
            setShowComments((prev) => ({ ...prev, [documentId]: false })); // Close accordion
        } else {
            try {
                const res = await getCommentsByDocument(documentId);
                setComments((prev) => ({ ...prev, [documentId]: res }));
                setShowComments((prev) => ({ ...prev, [documentId]: true })); // Open accordion
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        }
    };

    // ✅ Upload document
    const handleUpload = async () => {
        if (!selectedFile) {
            Swal.fire("Error!", "Please select a file first!", "error");
            return;
        }
        try {
            await uploadDocument(id, selectedFile);
            Swal.fire("Success!", "Document uploaded successfully!", "success");
            setSelectedFile(null);
            const docs = await getDocumentsByCustomer(id);
            setDocuments(docs);
        } catch (error) {
            Swal.fire("Error!", "Failed to upload document.", "error");
        }
    };

    // ✅ Add comment (Accordion remains open)
    const handleAddComment = async (documentId) => {
        if (!newComments[documentId]?.trim()) {
            Swal.fire("Error", "Comment cannot be empty", "warning");
            return;
        }
        try {
            const role = loggedInUser.role === "customer" ? "customer" : "employee";
            await addComment(documentId, newComments[documentId], loggedInUser?.user.id, role, loggedInUser?.user?.firstName);
            
            // ✅ Keep accordion open
            const res = await getCommentsByDocument(documentId);
            setComments((prev) => ({ ...prev, [documentId]: res }));

            // ✅ Clear input field
            setNewComments((prev) => ({ ...prev, [documentId]: "" }));

        } catch (error) {
            Swal.fire("Error", "Failed to add comment", "error");
        }
    };

    return (
        <Layout>
            <div className="view-customer-container">
                <h2 className="customer-heading">Customer Details</h2>

                {customer && (
                    <div className="customer-details-box">
                        <h3 className="customer-name">{customer.full_name}</h3>
                        <p className="customer-info">{customer.email}</p>
                        <p className="customer-info">{customer.phone}</p>
                    </div>
                )}

                {/* 📂 Document Upload */}
                <div className="upload-section">
                    <input type="file" ref={fileInputRef} className="hidden-file-input" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <button className="upload-btn" onClick={() => fileInputRef.current.click()}>Choose File</button>
                    {selectedFile && <button className="upload-btn" onClick={handleUpload}>Upload</button>}
                </div>

                {/* 📜 Documents Accordion */}
                <div className="documents-section">
                    <h2 className="documents-heading">Documents</h2>
                    <div className="accordion">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <div key={doc.id} className="accordion-item">
                                    <div className="accordion-header" onClick={() => toggleComments(doc.id)}>
                                        Document {doc.id}
                                        <span className="arrow">{showComments[doc.id] ? "▲" : "▼"}</span>
                                    </div>
                                    {showComments[doc.id] && (
                                        <div className="accordion-content">
                                            <a href={`${url2}${doc.document_url}`} target="_blank" rel="noopener noreferrer" className="view-document-btn">
                                                View Document
                                            </a>

                                            {/* 🟢 Comments Section */}
                                            <div className="comments-container">
                                                {comments[doc.id]?.map((comment, index) => (
                                                    <div key={index} className={`comment-bubble ${comment?.commented_by === loggedInUser.user.id ? "sent" : "received"}`}>
                                                        <strong>{comment?.commented_by_name}</strong>
                                                        <p>{comment?.comment_text}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* 📝 Add Comment */}
                                            <div className="comment-input-container">
                                                <input
                                                    type="text"
                                                    className="comment-input"
                                                    placeholder="Write a comment..."
                                                    value={newComments[doc.id] || ""}
                                                    onChange={(e) =>
                                                        setNewComments((prev) => ({
                                                            ...prev,
                                                            [doc.id]: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <button className="comment-btn" onClick={() => handleAddComment(doc.id)}>Send</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-documents">No documents uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>
            <CustomerProjects customerName = {customer?.full_name}/>
        </Layout>
    );
}

export default ViewCustomer;
