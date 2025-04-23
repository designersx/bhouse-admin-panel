import { jwtDecode } from "jwt-decode";

export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; 
  } catch (error) {
    return null;
  }
};
