import { useState, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import Layout from '../components/Layout';
import '../styles/profile.css';
import { getUserProfile, updateUserProfile } from '../lib/api';

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    userRole: '',
    profileImage: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserProfile();
        setFormData(res);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);

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
      await updateUserProfile(formData);
      alert('Profile Updated Successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Layout>
      <div className="profile-page-container">
        {/* Left Side: Profile Form */}
        <div className="profile-page-form">
          <h2 className="profile-page-title">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="profile-form-container">
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Email Address</label>
                <input
                  className="profile-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                />
              </div>
            </div>

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
              </div>
            </div>

            <div className="profile-form-group">
              <label>User Role</label>
              <input
                className="profile-input"
                type="text"
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                disabled
              />
            </div>

            <button type="submit" className="profile-update-btn">
              Update Profile
            </button>
          </form>
        </div>

        {/* Right Side: Profile Card */}
        <div className="profile-page-card">
          <div className="profile-pic-wrapper">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt="profile" className="profile-pic" />
            ) : (
              <img
                src={`${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
                alt="profile"
                className="profile-pic default-pic"
              />
            )}
            <button className="profile-edit-btn">
              <FaPen size={14} />
            </button>
          </div>
          <h3 className="profile-user-name">
            {formData.firstName || "User"} {formData.lastName || ""}
          </h3>
          <p className="profile-email-text">{formData.email || "No Email Provided"}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
