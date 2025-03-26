import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import { useParams } from "react-router-dom";
import {
  getCustomerById,
  uploadDocument,
  getDocumentsByCustomer,
  getCommentsByDocument,
  addComment,
} from "../../lib/api";
import Swal from "sweetalert2";
import "./style.css";

function ViewCustomer() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComments, setNewComments] = useState({}); // 🔹 New comment per document
  const fileInputRef = useRef(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchCustomer();
    fetchDocuments();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await getCustomerById(id);
      setCustomer(res);
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await getDocumentsByCustomer(id);
      setDocuments(res);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

const fetchComments = async (documentId) => {
  try {
    const res = await getCommentsByDocument(documentId);
    console.log("Fetched Comments:", res); // 🛠 Debugging ke liye

    setComments((prev) => ({
      ...prev,
      [documentId]: res, // 🛠 Ensure karo ki naye comments overwrite ho
    }));

    setShowComments((prev) => ({
      ...prev,
      [documentId]: !prev[documentId], // Toggle visibility
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
};
  const handleAddComment = async (documentId) => {
    if (!newComments[documentId]?.trim()) {
      Swal.fire("Error", "Comment cannot be empty", "warning");
      return;
    }
  
    try {
      const role = loggedInUser.role === "customer" ? "customer" : "employee";
      const response = await addComment(
        documentId,
        newComments[documentId],
        loggedInUser?.user.id,
        role,
        loggedInUser?.user?.firstName
      );
  
      console.log("New Comment Response:", response.comment); // 🛠 Debugging ke liye
  
      // ✅ **React ka Functional State Update Use Karo**
      setComments((prev) => {
        const updatedComments = prev[documentId] ? [...prev[documentId]] : [];
        updatedComments.push(response.comment);
        return { ...prev, [documentId]: updatedComments };
      });
  
      // ✅ **Input Box Clear karo**
      setNewComments((prev) => ({ ...prev, [documentId]: "" }));
  
    } catch (error) {
      Swal.fire("Error", "Failed to add comment", "error");
    }
  };
  

  const handleKeyPress = (e, documentId) => {
    if (e.key === "Enter") {
      handleAddComment(documentId);
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
            <p className="customer-company">Company: {customer.company_name}</p>
          </div>
        )}

        {/* 🟡 Documents Section */}
        <div className="documents-section">
          <h2 className="documents-heading">Documents</h2>
          <div className="documents-box">
            <input type="file" ref={fileInputRef} className="hidden-file-input" onChange={() => {}} />
            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
              Upload Document
            </button>

            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <h3 className="document-title">{doc.document_name.slice(0, 15)}...</h3>
                <p className="document-date">Uploaded on: {doc.createdAt}</p>
                <button className="view-comments-btn" onClick={() => fetchComments(doc.id)}>
                  {showComments[doc.id] ? "Hide Comments" : "View Comments"}
                </button>

                {/* 🟢 WhatsApp-Style Comments */}
                {showComments[doc.id] && (
                  <div className="comments-container">
                    {comments[doc.id]?.map((comment, index) => (
                      <div
                        key={index}
                        className={`comment-bubble ${
                          comment?.commented_by === loggedInUser.user.id
                            ? "sent"
                            : "received"
                        }`}
                      >
                        <strong>{comment?.commented_by_name}</strong>
                        <p>{comment?.comment_text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 📝 Add Comment */}
                {showComments[doc.id] && (
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
                      onKeyDown={(e) => handleKeyPress(e, doc.id)} // ✅ Enter key press
                    />
                    <button className="comment-btn" onClick={() => handleAddComment(doc.id)}>
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ViewCustomer;
