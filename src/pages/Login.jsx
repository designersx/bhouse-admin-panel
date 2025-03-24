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
  const navigate = useNavigate();

  // ✅ Remember Me - Load existing email
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('⚠️ Email and password are required.');
      return;
    }

    try {
      const res = await login(email, password);
      if (res) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        localStorage.setItem('user', JSON.stringify(res));
        navigate('/dashboard');
      }
    } catch (err) {
      console.log(err,'090880909999999')
      setError('❌ Invalid email or password.');
      console.error("Login Error:", err);
    }
  };

  const handleForgotPassword = () => {
    alert('Redirecting to Forgot Password page...');
  };

  return (
    <>
<Navbar isLogin={true} />
<div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Welcome Back 👋</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          maxLength={10} 
          required
        />

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

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
    </>
  );
};

export default Login;
