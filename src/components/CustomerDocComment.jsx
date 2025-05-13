import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { url, url2 } from '../lib/api';
import { FaTelegramPlane, FaArrowLeft } from 'react-icons/fa';
import '../styles/Projects/FileCommentsPage.css';
import Offcanvas from '../components/OffCanvas/OffCanvas';
import SpinnerLoader from './SpinnerLoader';

function CustomerDocComment() {
  const latestCommentRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { docName, docId } = useParams();


  const stateFileName = location.state?.fileName;
  const stateData = location.state?.data;
  const stateDocumentId = location.state?.documentId;

  const filePathz = location.state.filePath

  const fileName = stateFileName || decodeURIComponent(docName);
  const documentId = stateDocumentId || parseInt(docId);
 

  const document = stateData?.find((doc) =>
    doc.id === documentId || doc.documentType === fileName
  );

  const filePath = document?.filePath;
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.user?.id;

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(true);
  const scrollRef = useRef(null);

  const fetchComments = async () => {
    const counts = {};
    if (!documentId) return;
    try {
      const res = await axios.get(`${url}/customerDoc/comments/${documentId}`);
      setComments(res.data);
      const unreadComments = res.data.filter(comment => comment.User
      == null);
    
      
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };
  useEffect(() => {
    latestCommentRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);
const [loader , setLoader] = useState(false)
  const handleSubmit = async () => {
    setLoader(true)
    if (!comment || !documentId || !userId) return;

    try {
      const res = await axios.post(`${url}/customerDoc/comments`, {
        documentId,
        message: comment,
        userId,
      });
      
      setComment('');
      fetchComments();
    
    } catch (err) {
      console.error('Failed to submit comment:', err);
      console.log(err)

    }
    finally{
      setLoader(false)
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

  const groupedComments = {};
  comments.forEach((c) => {
    const date = new Date(c.createdAt).toLocaleDateString();
    if (!groupedComments[date]) groupedComments[date] = [];
    groupedComments[date].push(c);
  });
const effectiveFilePath = filePathz || filePath;
  return (
    <Layout>
      <div className="file-comments-split-container">
        <div className={isOffcanvasOpen ? 'left-panel' : 'left-panel2'}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h2 className="title">{fileName}</h2>

         <div className="file-preview">
  {effectiveFilePath?.endsWith('.pdf') ? (
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
              {Object.keys(groupedComments).map((date) => (
                <div key={date}>
                  <p className="whatsapp-comment-date">{date}</p>
                  {groupedComments[date].map((c) => {
                    const isUser = !!c.User;
                    const name = isUser
                      ? c.User.firstName
                      : c.Customer.full_name;
                    const role = isUser ? 'User' : 'Customer';

                    return (
                      <div key={c.id} className={`whatsapp-comment-box`}>
                        <div className="whatsapp-comment-user-info">
                          <img
                            src={`${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
                            alt="Profile"
                            className="whatsapp-comment-user-avatar"
                          />
                          <div>
                            <p className="whatsapp-comment-author">
                              {name}{' '}
                              <span className="comment-user-role">({role})</span>
                            </p>
                          </div>
                        </div>
                        <p className="whatsapp-comment-text">{c.message}</p>
                        <p className="whatsapp-comment-meta">
                          {new Date(c.createdAt).toLocaleTimeString()}
                        </p>
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
              onClick={()=>{if(!loader){
                handleSubmit()
              }else{

              }
                }}
              className="whatsapp-submit-btn"
              disabled={!comment.trim()}
              title={!comment.trim() ? "Type something first" : "Send comment"}
            >
              
              {loader ? <SpinnerLoader size={10}/>: <FaTelegramPlane />}
            </button>
          </div>
         
        </Offcanvas>
      </div>
    </Layout>
  );
}

export default CustomerDocComment;
