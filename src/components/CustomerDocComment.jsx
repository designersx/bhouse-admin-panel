import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { url, url2 } from '../lib/api';
import { FaTelegramPlane, FaArrowLeft } from 'react-icons/fa';
import '../styles/Projects/FileCommentsPage.css';
import Offcanvas from '../components/OffCanvas/OffCanvas';

function CustomerDocComment() {
  const latestCommentRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { docName, docId } = useParams();

  const stateFileName = location.state?.fileName;
  const stateData = location.state?.data;
  const stateDocumentId = location.state?.documentId;

  // --- CHANGED (safe optional chaining)
  const filePathz = location.state?.filePath;

  const fileName = stateFileName || decodeURIComponent(docName);
  const documentId = stateDocumentId || parseInt(docId);

  const document = stateData?.find(
    (doc) => doc.id === documentId || doc.documentType === fileName
  );

  const filePath = document?.filePath;
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user?.id;

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(true);
  const scrollRef = useRef(null);

  // --- ADDED: date helpers (IST)
  const _asDateInput = (v) => {
    const s = String(v ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s;
  };

  const fmtDateIST = (input, fallback = "—") => {
    if (input == null) return fallback;
    const d = new Date(_asDateInput(input));
    if (Number.isNaN(d.getTime())) return fallback;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(d);
  };

  const fmtDateTimeIST = (input, fallback = "—") => {
    if (input == null) return fallback;
    const d = new Date(_asDateInput(input));
    if (Number.isNaN(d.getTime())) return fallback;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(d);
  };

  // Build an IST calendar-day key (YYYY-MM-DD)
  const dayKeyIST = (input) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(new Date(_asDateInput(input)));

  const fetchComments = async () => {
    if (!documentId) return;
    try {
      const res = await axios.get(`${url}/customerDoc/comments/${documentId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  useEffect(() => {
    latestCommentRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const [loader, setLoader] = useState(false);
  const handleSubmit = async () => {
    if (!comment || !documentId || !userId) return;

    const tempComment = {
      id: `temp-${Date.now()}`,
      message: comment,
      createdAt: new Date().toISOString(),
      User: user.user,
      Customer: null,
    };

    setComments((prevComments) => [...prevComments, tempComment]);
    setComment("");
    setLoader(true);

    try {
      await axios.post(`${url}/customerDoc/comments`, {
        documentId,
        message: comment,
        userId,
      });
      fetchComments();
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const openOffcanvas = () => setIsOffcanvasOpen(true);
  const closeOffcanvas = () => setIsOffcanvasOpen(false);

  // --- CHANGED: group by IST calendar day instead of local default
  const groupedComments = comments.reduce((acc, c) => {
    const key = dayKeyIST(c.createdAt);
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  const effectiveFilePath = filePathz || filePath;

  return (
    <Layout>
      <div className="file-comments-split-container">
        <div className={isOffcanvasOpen ? "left-panel" : "left-panel2"}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h2 className="title">{fileName}</h2>

          <div className="file-preview">
            {effectiveFilePath?.endsWith(".pdf") ? (
              <iframe
                src={`${url2}/${effectiveFilePath}`}
                title="File Preview"
                className="preview-frame"
              />
            ) : (
              <img
                src={`${url2}/${effectiveFilePath}`}
                alt="Preview"
                className="preview-img1"
              />
            )}
          </div>
        </div>

        <button className="view-doc" onClick={openOffcanvas}>
          View Comments
        </button>

        <Offcanvas
          isOpen={isOffcanvasOpen}
          closeOffcanvas={closeOffcanvas}
          getLatestComment={fetchComments}
        >
          <div className="right-panel">
            <div className="comments-list" ref={scrollRef}>
              {Object.keys(groupedComments)
                .sort((a, b) => a.localeCompare(b)) // YYYY-MM-DD sorts correctly
                .map((key) => (
                  <div key={key}>
                    {/* --- CHANGED: pretty group header */}
                    {/* <p className="whatsapp-comment-date">{fmtDateIST(key)}</p> */}

                    {groupedComments[key]
                      .sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                      )
                      .map((c) => {
                        const isUser = !!c.User;
                        const name = isUser
                          ? `${c.User.firstName} ${c.User.lastName || ""}`.trim()
                          : c.Customer?.full_name || "Customer";
                        const role = isUser
                          ? c.User.userRole || "User"
                          : "Customer";
                        const profileImage =
                          isUser && c.User.profileImage
                            ? `${url2}/${c.User.profileImage}`
                            : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`;

                        return (
                          <div key={c.id} className="whatsapp-comment-box">
                            <div className="whatsapp-comment-user-info">
                              <img
                                src={profileImage}
                                alt={name}
                                className="whatsapp-comment-user-avatar"
                              />
                              <div>
                                {/* --- CHANGED: Name (Role) · date-time */}
                                <p className="whatsapp-comment-author">
                                  {name} <span className="comment-user-role">({role})</span> ·{" "}
                                  {fmtDateTimeIST(c.createdAt)}
                                </p>
                              </div>
                            </div>

                            <p className="whatsapp-comment-text">{c.message}</p>

                            {/* (Optional) remove to avoid duplicate time
                            <p className="whatsapp-comment-meta">
                              {fmtDateTimeIST(c.createdAt)}
                            </p>
                            */}
                          </div>
                        );
                      })}
                  </div>
                ))}
              <div ref={latestCommentRef} />
            </div>
          </div>

          <div className="whatsapp-comment-form">
            <textarea
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="whatsapp-comment-input"
            />
            <button
              onClick={() => {
                if (!loader) handleSubmit();
              }}
              className="whatsapp-submit-btn"
              disabled={!comment.trim()}
              title={!comment.trim() ? "Type something first" : "Send comment"}
            >
              <FaTelegramPlane />
            </button>
          </div>
        </Offcanvas>
      </div>
    </Layout>
  );
}

export default CustomerDocComment;
