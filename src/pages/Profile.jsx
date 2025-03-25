import { useState, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import Layout from '../components/Layout';
import '../styles/profile.css';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../lib/api';
import imageCompression from 'browser-image-compression';
import Swal from 'sweetalert2'; // NEW

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    userRole: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile(); // ✅ API se data le rahe hain
        setFormData(res);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUserProfile(formData);
      Swal.fire('Success', 'Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Profile update failed', 'error');
    }finally{
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-container">
        {loading && <div className="loader-overlay">Loading...</div>}
        {/* Left Side: Form */}
        <div className="profile-form">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className='p-input'
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled // ✅ Email ko disable rakhenge (non-editable)
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  className='p-input'
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  className='p-input'
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className='p-input'
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

          <div className="form-row">
            <div className="form-group">
              <label>User Role</label>
              <input
                className='p-input'
                type="text"
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                disabled // ✅ Role ko disable rakhenge (non-editable)
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                className='p-input'
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                maxLength={6}
              />
            </div>
            </div>
            <button type="submit" className="update-btn">
              Update Profile
            </button>
          </form>
        </div>

        {/* Right Side: Profile Card */}
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
