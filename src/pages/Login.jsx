import { useState, useEffect } from 'react';
import '../styles/login.css';
import { login } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message , setMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (value) => {
    if (value === '') {
      setEmailError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };
  

  const validatePassword = (value) => {
    if (value === '') {
      setPasswordError('');
      return;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('⚠️ Email and password are required.');
      setIsLoading(false);
      return;
    }

    // Stop submission if validation errors exist
    if (emailError || passwordError) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      if (res) {
        setMessage(res?.message);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        localStorage.setItem('user', JSON.stringify(res));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      console.error("Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <>
      <Navbar isLogin={true} />
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back 👋</h2>

          {error && <div className="error-message">{error}</div>}

          <input className='login-input'
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            placeholder="Email"
            required
          />
          {emailError && <p className="error-text">{emailError}</p>}

          <input 
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            placeholder="Password"
            maxLength={6}
            required
          />
          {passwordError && <p className="error-text">{passwordError}</p>}

          <div className="login-options">
            <div className="checkbox-wrapper">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me">Remember Me</label>
            </div>

            <span className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
