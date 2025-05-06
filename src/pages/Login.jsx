import { useState, useEffect } from "react";
import "../styles/login.css";
import { login } from "../lib/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getFcmToken } from "../firebase/getFCMToken/getToken";
import { sendFcmToken } from "../firebase/sendFcmTokenToDb/sendFcmToDb";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    // Check lockout status on mount
    const lockoutTime = localStorage.getItem("loginLockoutTime");
    if (lockoutTime && Date.now() < Number(lockoutTime)) {
      setIsLockedOut(true);
      const remaining = Number(lockoutTime) - Date.now();
      setTimeout(() => setIsLockedOut(false), remaining);
    }
  }, []);

  const validateForm = () => {
    toast.dismiss();
  
    if (!email) {
      toast.error(" Email is required.");
      return false;
    }
  
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid email format.");
      return false;
    }
  
    if (!password) {
      toast.error(" Password is required.");
      return false;
    }
  
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
  
    return true;
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error("Too many failed attempts. Try again after 1 minute.");
      return;
    }

    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      toast.success("Login Successful!");
      const { user } = res

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
        //save Fcm
        const FCM_Token = await getFcmToken();
        await sendFcmToken(FCM_Token, user.id)
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        //save Fcm
        const FCM_Token = await getFcmToken();
        await sendFcmToken(FCM_Token, user.id)
      }

      localStorage.setItem("user", JSON.stringify(res));
      localStorage.removeItem("failedLoginAttempts");
      window.location.href = "/dashboard";
    } catch (err) {
      // Increment failed login count
      const attempts = Number(localStorage.getItem("failedLoginAttempts")) || 0;
      const newAttempts = attempts + 1;

      localStorage.setItem("failedLoginAttempts", newAttempts);

      if (newAttempts >= 3) {
        const lockoutDuration = 60 * 1000; // 1 minute
        const lockoutUntil = Date.now() + lockoutDuration;
        localStorage.setItem("loginLockoutTime", lockoutUntil);
        setIsLockedOut(true);
        toast.error(" You've exceeded the login limit. Try again in 1 minute.");
        setTimeout(() => setIsLockedOut(false), lockoutDuration);
      } else {
        toast.error(err.message || " Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Navbar isLogin={true} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>

          <div className="input-group">
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="input-group">
            <input
              className="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"

              maxLength={15}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="form_footer">
            <div className="remember-me">
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>

            <div className="login-options">
              <div className="forgot-password" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </div>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading || isLockedOut}>
            {isLoading ? <div className="login-spinner"></div> : "Login"}
          </button>

        </form>
      </div>
    </>
  );
};

export default Login;
