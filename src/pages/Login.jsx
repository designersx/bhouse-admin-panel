import { useState, useEffect } from 'react';
import '../styles/login.css';
import { login } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword'); // Fetch password

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword); // Set password
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(value && !emailRegex.test(value) ? 'Invalid email address' : '');
  };

  const validatePassword = (value) => {
    setPasswordError(value && value.length < 6 ? 'Password must be at least 6 characters' : '');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error('⚠️ Email and password are required.');
      setIsLoading(false);
      return;
    }
    if (emailError || passwordError) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      toast.success('✅ Login Successful');

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password); // Save password (Unsafe)
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword'); // Remove password
      }

      localStorage.setItem('user', JSON.stringify(res));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || '❌ Login failed');
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
          <h2>Welcome Back 👋</h2>

          <div className="input-group">
            <input
              className='login-input'
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              placeholder="Email"
            />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div className="input-group">
            <input
              className='password-input'
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              minLength={6}
              maxLength={15}
              placeholder="Password"
            />
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          {/* Remember Me Checkbox */}
          <div className='form_footer'>
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <div className="login-options">
            <span className="forgot-password" onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </span>
          </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="login-spinner"></div> : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
