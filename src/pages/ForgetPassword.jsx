import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { forgetPassword, verifyOtp, resetPassword } from '../lib/api';
import Swal from 'sweetalert2';
import '../styles/forgetPassword.css';
import Navbar from '../components/Navbar';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const urlEmail = query.get('email');
    const urlOtp = query.get('otp');
    if (urlEmail && urlOtp) {
      setEmail(urlEmail);
      setOtp(urlOtp);
      setOtpSent(true);
    }
  }, []);

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        if (value === '') {
          newErrors.email = '';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          newErrors.email = emailRegex.test(value) ? '' : 'Please enter a valid email.';
        }
        break;

      case 'otp':
        if (value === '') {
          newErrors.otp = '';
        } else {
          const otpRegex = /^\d{4,6}$/;
          newErrors.otp = otpRegex.test(value) ? '' : 'Invalid OTP format.';
        }
        break;

      case 'newPassword':
        if (value === '') {
          newErrors.newPassword = '';
        } else {
          newErrors.newPassword = value.length < 6 ? 'Password must be at least 6 characters.' : '';
        }
        break;

      case 'confirmPassword':
        if (value === '') {
          newErrors.confirmPassword = '';
        } else {
          newErrors.confirmPassword = value !== newPassword ? 'Passwords do not match.' : '';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleGenerateOtp = async () => {
    if (!email || errors.email) {
      Swal.fire('Error', '⚠️ Please enter a valid email address.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await forgetPassword(email);
      if (response.success) {
        setOtpSent(true);
        Swal.fire('Success', 'OTP sent successfully!', 'success');
      } else {
        Swal.fire('Error', '❌ Failed to send OTP.', 'error');
      }
    } catch {
      Swal.fire('Error', '❌ Error generating OTP.', 'error');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || errors.otp) {
      Swal.fire('Error', '⚠️ Please enter a valid OTP.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyOtp(email, otp);
      if (response.success) {
        setOtpVerified(true);
        Swal.fire('Success', 'OTP Verified successfully!', 'success');
      } else {
        Swal.fire('Error', '❌ Invalid OTP.', 'error');
      }
    } catch {
      Swal.fire('Error', '❌ Error verifying OTP.', 'error');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword || errors.newPassword || errors.confirmPassword) {
      Swal.fire('Error', '⚠️ Please fix all password errors.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await resetPassword(email, newPassword);
      if (response.success) {
        navigate('/');
        Swal.fire('Success', 'Password reset successfully!', 'success');
      } else {
        Swal.fire('Error', '❌ Error resetting password.', 'error');
      }
    } catch {
      Swal.fire('Error', '❌ Error resetting password.', 'error');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar isLogin={true} />
      <div className='main-container'>
        <div className="forgot-password-container">
          <h2>{!otpSent ? "Reset Password" : otpVerified ? "Password Reset" : "Verify OTP"}</h2>
          <p>
            {!otpSent
              ? "Enter your email and we'll send you a link to reset your password."
              : otpVerified
                ? "Set your new password"
                : "Enter the OTP sent to your email to verify and continue."
            }
          </p>

          {/* Email input */}
          {!otpSent && (
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateField('email', e.target.value);
                }}
                placeholder="Enter your email"
                required
              />
              {errors.email && <p className="error-text">{errors.email}</p>}

              <button className='forget-btn' onClick={handleGenerateOtp} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : 'Generate OTP'}
              </button>
            </div>
          )}

          {/* OTP input */}
          {otpSent && !otpVerified && (
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  validateField('otp', e.target.value);
                }}
                placeholder="Enter OTP"
                required
              />
              {errors.otp && <p className="error-text">{errors.otp}</p>}

              <button className='forget-btn' onClick={handleVerifyOtp} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : 'Verify OTP'}
              </button>
            </div>
          )}

          {/* Password inputs */}
          {otpVerified && (
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validateField('newPassword', e.target.value);
                }}
                placeholder="New Password"
                maxLength={6}
                required
              />
              {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateField('confirmPassword', e.target.value);
                }}
                placeholder="Confirm Password"
                maxLength={6}
                required
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

              <button className='forget-btn' onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : 'Reset Password'}
              </button>
            </div>
          )}

          <div className="additional-links">
            <p>Remember your password? <span onClick={() => navigate("/")}>Sign In</span></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
