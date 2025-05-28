import axios from 'axios'
export const url = 'http://localhost:8587/api' || ""
export const url2 = 'http://localhost:8587' || ""
// export const url = 'https://bhouse.truet.net/api' || ""
// export const url2 = 'https://bhouse.truet.net' || ""
export const registerUser = async (userData) => {
  try {
    // fds
    const res = await axios.post(`${url}/auth/signup`, userData);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${url}/auth/getAllUsers`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
export const login = async (email, pass) => {
  try {
    let res = await axios.post(`${url}/auth/login`, {
      email: email,
      password: pass,
    })
    return res.data;

  } catch (error) {
    console.log("error", { error })
    throw error.response.data;
  }

}
export const deleteUser = async (id) => {
  const response = await fetch(`${url}/auth/deleteUser/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return response.json();
};
export const getUserProfile = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const res = await axios.get(`${url}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return res.data;
};

export const updateUserProfile = async (data) => {

  const user = JSON.parse(localStorage.getItem('user'));
  const res = await axios.put(`${url}/auth/editUser/${user.user.id}`, data);
  return res.data;
};

export const getRoles = async () => {
  try {
    const response = await axios.get(`${url}/roles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await axios.post(`${url}/roles`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};
export const getRoleById = async (id) => {
  return await axios.get(`${url}/roles/${id}`).then((res) => res.data);
};
export const updateRole = async (id, roleData) => {
  return await axios.put(`${url}/roles/${id}`, roleData);
};

export const deleteRole = async (id) => {
  return await axios.delete(`${url}/roles/${id}`);
};


//forgetPassword
export const forgetPassword = async (email) => {
  try {
    const response = await axios.post(`${url}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error.response?.data || error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${url}/auth/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error.response?.data || error;
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(`${url}/auth/reset-password`, { email, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error.response?.data || error;
  }
};

export const editUser = async (id, updatedUser) => {
  try {
    const response = await fetch(`${url}/auth/editUser/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await fetch(`${url}/customer/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating customer:", error);
  }
};

export const getCustomers = async () => {
  try {
    const response = await fetch(`${url}/customer`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};


export const uploadProfileImage = async (file) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));

    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await axios.put(`${url}/auth/profile/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error.response?.data || error;
  }
};
// 🔵 Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(`${url}/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer", error);
    return null;
  }
};

// 🟡 Update customer
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axios.put(`${url}/customer/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error("Error updating customer", error);
    throw error;
  }
};

// 🔴 Delete customer
export const deleteCustomer = async (id) => {
  try {
    await axios.delete(`${url}/customer/${id}`);
  } catch (error) {
    console.error("Error deleting customer", error);
    throw error;
  }
};
export const uploadDocument = async (customerId, file) => {
  let userId = JSON.parse(localStorage.getItem("user"))
  try {
    const formData = new FormData();
    formData.append("customer_id", customerId);
    formData.append("document_name", file.name);
    formData.append("uploaded_by", userId.user.id); // Manually set user ID (Replace it dynamically if needed)
    formData.append("document", file);

    const response = await axios.post(`${url}/documents/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

// ✅ Fetch Documents API (Uploaded Documents List)
export const getDocumentsByCustomer = async (customerId) => {
  try {
    const response = await axios.get(`${url}/documents/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
// ✅ Fetch Comments API
// ✅ Fetch Comments API (With Commenter's Name)
// ✅ Add Comment API
export const addComment = async (documentId, comment, commentedBy, role, commented_by_name) => {
  try {
    const response = await axios.post(`${url}/comments/add`, {
      document_id: documentId,
      comment_text: comment,
      commented_by: commentedBy,
      role,
      commented_by_name: commented_by_name
    });
    return response.data.comment;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// ✅ Fetch Comments API
export const getCommentsByDocument = async (documentId) => {
  try {
    const response = await axios.get(`${url}/comments/document/${documentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};


// ✅ Delete Comment API
export const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(`${url}/comments/delete/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await axios.delete(`${url}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};


export const addCustomerComment = async (customerId, commentData) => {
  const response = await fetch(`${url}/customer/addComment/${customerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
  });
  return response.json();
};
export const getCustomerComments = async (customerId) => {
  const response = await fetch(`${url}/customer/getComment/${customerId}`);
  return response.json();
};
export const getNotificationsByUser = async (userId) => {
  const response = await axios.get(`${url}/getNotificationsByUser/${userId}`);
  return response
}
export const markNotificationRead = async (notificationId) => {
  return await axios.put(`${url}/notifications/mark-read/${notificationId}`);
};