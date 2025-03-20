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