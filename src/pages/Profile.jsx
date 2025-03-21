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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserProfile(); // ✅ API se data le rahe hain
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
      await updateUserProfile(formData); // ✅ API se update kar rahe hain
      alert('Profile Updated Successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Layout>
      <div className="profile-container">
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

            <button type="submit" className="update-btn">
              Update Profile
            </button>
          </form>
        </div>

      {/* Right Side: Profile Card */}
<div className="profile-card">
  <div className="profile-pic-container">
    {formData.profileImage ? (
      <img src={formData.profileImage} alt="profile" className="profile-pic" />
    ) : (
      <img
        src={`${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`}
        alt="profile"
        className="profile-pic default-pic"
      />
    )}
    <button className="edit-btn">
      <FaPen size={14} />
    </button>
  </div>
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
