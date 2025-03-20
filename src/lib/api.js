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