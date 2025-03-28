import { useState, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import Layout from '../components/Layout';
import '../styles/profile.css';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../lib/api';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2';

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    userRole: '',
    password: '',
    profileImage: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile();
        setFormData(res);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const nameRegex = /^[A-Za-z\s]+$/;
    const mobileRegex = /^\d{10}$/;
    const passwordRegex = /^[A-Za-z0-9]{6}$/;

    switch (name) {
      case 'firstName':
      case 'lastName':
        newErrors[name] = !value
          ? `${name === 'firstName' ? 'First' : 'Last'} Name is required`
          : !nameRegex.test(value)
            ? `${name === 'firstName' ? 'First' : 'Last'} Name must contain only letters`
            : '';
        break;

      case 'mobileNumber':
        newErrors.mobileNumber = !value
          ? 'Mobile Number is required'
          : !mobileRegex.test(value)
            ? 'Enter a valid 10-digit number'
            : '';
        break;

      case 'password':
        newErrors.password = value && !passwordRegex.test(value)
          ? 'Password must be 6 alphanumeric characters'
          : '';
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run full validation on all fields
    ['firstName', 'lastName', 'mobileNumber', 'password'].forEach((field) =>
      validateField(field, formData[field])
    );

    // Check if any validation errors exist
    const hasErrors = Object.values(errors).some((err) => err !== '');
    if (hasErrors) {
      Swal.fire('Error', 'Please fix all the errors before submitting.', 'error');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(formData);
      Swal.fire('Success', 'Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Profile update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const res = await uploadProfileImage(compressedFile);

      Swal.fire('Success', 'Profile image updated!', 'success');
      setFormData((prev) => ({
        ...prev,
        profileImage: res.path,
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      Swal.fire('Error', 'Image upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-container">
        {loading && (
          <div className="loader-overlay">
            <div className="loader"></div>
          </div>
        )}


        <div className="profile-form">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>First Name</label>
                <input
                  className="profile-input"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="error">{errors.firstName}</p>}
              </div>

              <div className="profile-form-group">
                <label>Last Name</label>
                <input
                  className="profile-input"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Email Address</label>
                <input
                  className="profile-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="profile-form-group">
                <label>Mobile Number</label>
                <input
                  className="profile-input"
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>User Role</label>
                <input
                  className="profile-input"
                  type="text"
                  name="userRole"
                  value={formData.userRole}
                  disabled
                />
              </div>

              <div className="profile-form-group">
                <label>Password:</label>
                <input
                  className="profile-input"
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  maxLength={15}
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
            </div>

            <button type="submit" className="update-btn">Update Profile</button>
          </form>
        </div>


        {/* Right side: Profile card */}
        <div className="profile-card">
          <div className="profile-pic-container">
            <img
              src={
                formData.profileImage
                  ? `http://localhost:5000/${formData.profileImage}`
                  : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
              }
              alt="profile"
              className="profile-pic"
            />
          </div>

          <label className="edit-btn">
            <FaPen size={14} /> Edit
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>

          <h3 className="profile-name">
            {formData.firstName || "User"} {formData.lastName || ""}
          </h3>
          <p className="email-text">{formData.email || "No Email Provided"}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
