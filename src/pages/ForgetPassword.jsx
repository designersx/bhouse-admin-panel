import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgetPassword, verifyOtp, resetPassword } from '../lib/api'; // Your API functions here
import Swal from 'sweetalert2'; // Import SweetAlert
import '../styles/forgetPassword.css';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleGenerateOtp = async () => {
    if (!email) {
      Swal.fire('Error', '⚠️ Please enter your email address.', 'error');
      return;
    }
    setIsLoading(true); // Start loading

    try {
      const response = await forgetPassword(email);
      if (response.success) {
        setOtpSent(true);
        Swal.fire('Success', 'OTP sent successfully!', 'success');
      } else {
        Swal.fire('Error', '❌ Failed to send OTP.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', '❌ Error generating OTP.', 'error');
    }
    setIsLoading(false); // End loading
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Swal.fire('Error', '⚠️ Please enter the OTP.', 'error');
      return;
    }
    setIsLoading(true); // Start loading

    try {
      const response = await verifyOtp(email, otp);
      if (response.success) {
        setOtpVerified(true);
        Swal.fire('Success', 'OTP Verified successfully!', 'success');
      } else {
        Swal.fire('Error', '❌ Invalid OTP.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', '❌ Error verifying OTP.', 'error');
    }
    setIsLoading(false); // End loading
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Swal.fire('Error', '⚠️ Please enter both password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', '❌ Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true); // Start loading

    try {
      const response = await resetPassword(email, newPassword);
      if (response.success) {
        navigate('/');
        Swal.fire('Success', 'Password reset successfully!', 'success');
      } else {
        Swal.fire('Error', '❌ Error resetting password.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', '❌ Error resetting password.', 'error');
    }
    setIsLoading(false); // End loading
  };

  return (
    <>
      <Navbar isLogin={true} />
      <div className='main-container'>
        <div className="forgot-password-container">
          {/* Conditionally Render Text */}
          <h2>{!otpSent ? "Reset Password" : otpVerified ? "Password Reset" : "Verify OTP"}</h2>
          <p>
            {!otpSent 
              ? "Enter your email and we'll send you a link to reset your password."
              : otpVerified 
                ? "Set your new password"
                : "Enter the OTP sent to your email to verify and continue."
            }
          </p>

          {/* Generate OTP Section */}
          {!otpSent ? (
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <button className='forget-btn' onClick={handleGenerateOtp} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : 'Generate OTP'}
              </button>
            </div>
          ) : (
            <div>
              {/* Conditionally Render OTP Input and Verify Button */}
              {!otpVerified && (
                <>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                  <button className='forget-btn' onClick={handleVerifyOtp} disabled={isLoading}>
                    {isLoading ? <div className="spinner"></div> : 'Verify OTP'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Password Reset Section */}
          {otpVerified && (
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                maxLength={6}
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                maxLength={6}
                required
              />
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
