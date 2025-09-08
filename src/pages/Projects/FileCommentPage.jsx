import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url, url2 } from '../../lib/api';
import Layout from '../../components/Layout';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/Projects/FileCommentsPage.css';
import Offcanvas from '../../components/OffCanvas/OffCanvas';
import { FaTelegramPlane } from 'react-icons/fa';
const FileCommentsPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { filePath, category } = location.state;
  console.log(category, filePath, "abc")

  const [loader, setLoader] = useState(false)
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const storedUser = localStorage.getItem('user');
  const userId = storedUser ? JSON.parse(storedUser).user.id : null;
  const latestCommentRef = useRef(null);
  useEffect(() => {
    latestCommentRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${url}/projects/${projectId}/file-comments`, {
        params: { filePath }
      });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSubmit = async () => {
    if (!comment || !userId) return alert("Comment or User ID missing");

    const tempComment = {
      id: `temp-${Date.now()}`,
      comment: comment,
      createdAt: new Date().toISOString(),
      user: JSON.parse(storedUser).user,
      customer: null,
    };

    // Optimistically update UI
    setComments(prevComments => [...prevComments, tempComment]);
    setComment('');
    setLoader(true);

    try {
      await axios.post(`${url}/projects/${projectId}/file-comments`, {
        filePath,
        category,
        comment,
        userId
      });

    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setLoader(false);
    }
  };


  useEffect(() => {
    fetchComments();
  }, []);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(true);

  const openOffcanvas = () => {
    setIsOffcanvasOpen(true);
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

    // Build a day key in IST (YYYY-MM-DD) for grouping
  const dayKeyIST = (input) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata",
    }).format(new Date(_asDateInput(input))); // e.g., "2025-09-18"
 // --- date helpers (IST) ---
  const _asDateInput = (v) => {
    const s = String(v ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s;
  };

  const fmtDateTimeIST = (input, fallback = "—") => {
    if (input == null) return fallback;
    const d = new Date(_asDateInput(input));
    if (Number.isNaN(d.getTime())) return fallback;
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(d); // e.g., "Sep 18, 2025, 10:45 AM"
  };



  // --- name/role helpers ---
  const getDisplayName = (c) => {
    if (c.user) {
      const u = c.user;
      if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
      return u.firstName || u.name || "User";
    }
    if (c.customer) return c.customer.full_name || "Customer";
    return "Customer";
  };

  const getRole = (c) => (c.user?.userRole ? c.user.userRole : c.customer ? "Customer" : undefined);
  const groupedComments = comments.reduce((acc, c) => {
    const key = dayKeyIST(c.createdAt);
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  comments.forEach((comment) => {
    const commentDate = new Date(comment.createdAt).toLocaleDateString();
    if (!groupedComments[commentDate]) {
      groupedComments[commentDate] = [];
    }
    groupedComments[commentDate].push(comment);
  });
 

  return (
    <Layout>
      <div className="file-comments-split-container">
        <div className={isOffcanvasOpen ? "left-panel" : "left-panel2"}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h2 className="title">File Preview</h2>

          <div className="file-preview">
            {filePath.endsWith('.pdf') ? (
              <iframe src={`${url2}/${filePath}`} title="File Preview" className="preview-frame" />
            ) : (
              <img src={`${url2}/${filePath}`} alt="File Preview" className="preview-img1" />
            )}
          </div>
        </div>
        <button className='view-doc' onClick={openOffcanvas}>View Comments</button>
        <Offcanvas isOpen={isOffcanvasOpen} closeOffcanvas={closeOffcanvas} getLatestComment={fetchComments}>
          <div className="right-panel">
            <div className="comments-list">
              {Object.keys(groupedComments)
                .sort((a, b) => a.localeCompare(b)) // YYYY-MM-DD sorts correctly
                .map((key) => (
                  <div key={key}>
                    {/* Pretty group header */}
                    {/* <p className="whatsapp-comment-date">{fmtDateIST(key)}</p> */}

                    {groupedComments[key]
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map((c) => (
                        <div key={c.id} className="whatsapp-comment-box">
                          <div className="whatsapp-comment-user-info">
                            <img
                              src={
                                c.user?.profileImage
                                  ? `${url2}/${c.user.profileImage}`
                                  : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
                              }
                              alt="User"
                              className="whatsapp-comment-user-avatar"
                            />
                            <div>
                              {/* Name (Role) · Date, Time */}
                              <p className="whatsapp-comment-author">
                                {getDisplayName(c)}
                                {getRole(c) ? ` (${getRole(c)})` : ""} · {fmtDateTimeIST(c.createdAt)}
                              </p>
                            </div>
                          </div>

                          <p className="whatsapp-comment-text">{c.comment}</p>

                          {/* remove separate meta time to avoid duplication
                  <p className="whatsapp-comment-meta">{fmtDateTimeIST(c.createdAt)}</p>
                  */}
                        </div>
                      ))}
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
            <button onClick={handleSubmit} className="whatsapp-submit-btn">
              <FaTelegramPlane />
            </button>
          </div>
        </Offcanvas>


      </div>
    </Layout>

  );
};

export default FileCommentsPage;
