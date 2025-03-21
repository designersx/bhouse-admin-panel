import { jwtDecode } from "jwt-decode";

export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    console.log(decoded.exp,'77777777')
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};
