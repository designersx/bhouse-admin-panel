import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Swal from 'sweetalert2';
import axios from 'axios';
import { url } from '../../lib/api';
import './RequestForm.css';
import Loader from '../../components/Loader';

const RequestForm = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); 

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${url}/requests`);
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this request.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004680',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${url}/requests/${id}`);
        setRequests(prev => prev.filter(r => r.id !== id));
        Swal.fire('Deleted!', 'The request has been deleted.', 'success');
        setSelected(null);
      } catch (err) {
        Swal.fire('Error', 'Failed to delete request.', 'error');
      }
    }
  };

  const filteredRequests = requests.filter((r) =>
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Layout>
      <div className="request-page">
        <h2 className="request-title">Customer Requests</h2>

        <input
          type="text"
          className="search-inputa"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <Loader /> 
        ) : (
          <div className="request-grid">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <div className="request-card" key={req.id} onClick={() => setSelected(req)}>
                  <h3>{req.fullName}</h3>
                  <p><strong>Email:</strong> {req.email}</p>
                  <p><strong>Phone:</strong> {req.phone}</p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", marginTop: "20px" }}>No requests found.</p>
            )}
          </div>
        )}

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
              <h2>Request Details</h2>
              <p><strong>Full Name:</strong> {selected.fullName}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Phone:</strong> {selected.phone}</p>
              <p><strong>Company:</strong> {selected.companyName}</p>
              <p><strong>Address:</strong> {selected.address}</p>
              <p><strong>Description:</strong> {selected.description}</p>
              <button className="delete-btn" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RequestForm;
