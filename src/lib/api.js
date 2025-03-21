import axios from 'axios'
export const url = 'http://localhost:5000/api'
export const registerUser = async (userData) => {
  try {
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
export const login = async(email , pass)=>{
    try {
        let res = await axios.post(`${url}/auth/login` , {
            email : email , 
            password :pass , 
        })
        return res.data;
        
    } catch (error) {
      console.log("error" , {error})
      throw error.response.data;
    }

}
export const deleteUser = async (id) => {
  const response = await fetch(`http://localhost:5000/api/auth/deleteUser/${id}`, {
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
    const res = await axios.put(`${url}/auth/editUser/${user.user.id}` , data);
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