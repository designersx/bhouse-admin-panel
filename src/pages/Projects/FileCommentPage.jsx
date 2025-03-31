import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url, url2 } from '../../lib/api';
import Layout from '../../components/Layout';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/Projects/FileCommentsPage.css'; 

const FileCommentsPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { filePath, category } = location.state;

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const storedUser = localStorage.getItem('user'); 
const userId = storedUser ? JSON.parse(storedUser).user.id : null;
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

    try {
      await axios.post(`${url}/projects/${projectId}/file-comments`, {
        filePath,
        category,
        comment,
        userId
      });
      setComment('');
      fetchComments();
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <Layout>
    <div className="file-comments-split-container">
      <div className="left-panel">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="title">File Preview</h2>
  
        <div className="file-preview">
          {filePath.endsWith('.pdf') ? (
            <iframe src={`${url2}/${filePath}`} title="File Preview" className="preview-frame" />
          ) : (
            <img src={`${url2}/${filePath}`} alt="File Preview" className="preview-img" />
          )}
        </div>
      </div>
  
      <div className="right-panel">
        <h2 className="title">Comments</h2>
        <div className="comments-list">
          {comments.length > 0 ? comments.map((c) => (
            <div key={c.id} className="comment-box">
              <div className="comment-user-info">
                <img
                  src={c.user?.profileImage ? `${url2}/${c.user.profileImage}` : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
                  alt="User"
                  className="comment-user-avatar"
                />
                <div>
                  <p className="comment-author">{c.user?.firstName} {c.user?.lastName}</p>
                  <p className="comment-meta">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="comment-text">{c.comment}</p>
            </div>
          )) : <p>No comments yet.</p>}
        </div>
  
        <div className="comment-form">
          <textarea
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
          />
          <button onClick={handleSubmit} className="submit-btn">Submit</button>
        </div>
      </div>
    </div>
  </Layout>
  
  );
};

export default FileCommentsPage;
