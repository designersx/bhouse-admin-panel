import { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getTokenExpiration } from "../utils/checkTokenExpiry";

const useSessionTimeout = (token) => {
  const navigate = useNavigate();
// 
  useEffect(() => {
    if (!token) return;

    const expirationTime = getTokenExpiration(token);
    if (!expirationTime) return;

    const currentTime = Date.now();
    const timeLeft = expirationTime - currentTime;

    const handleSessionExpired = () => {
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        confirmButtonText: "OK",
      }).then(() => {
        localStorage.removeItem("user");
        navigate("/"); // Redirect to login
      });
    };

    if (timeLeft <= 0) {
      handleSessionExpired();
    } else {
      const timeout = setTimeout(() => {
        handleSessionExpired();
      }, timeLeft);

      return () => clearTimeout(timeout);
    }
  }, [token, navigate]); // ✅ Clean, no warning
};

export default useSessionTimeout;
