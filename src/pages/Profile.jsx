import { useState } from 'react';
import { FaPen } from 'react-icons/fa';
import Layout from '../components/Layout';
import '../styles/profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    username: 'michael23',
    email: '',
    firstName: 'Mike',
    lastName: 'Andrew',
    address: 'Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09',
    city: 'Mike',
    country: 'Andrew',
    aboutMe:
      "Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saved Data:', formData);
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
                <label>Username</label>
                <input
                  className='p-input'
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className='p-input'
                  type="email"
                  name="email"
                  value={formData.email}
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
                <label>Address</label>
                <input
                  className='p-input'
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  className='p-input'
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                className='p-input'
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>About Me</label>
              <textarea
                className='p-input'
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
              ></textarea>
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
              src="https://i.pravatar.cc/150"
              alt="User"
              className="profile-pic"
            />
            <button className="edit-btn">
              <FaPen size={14} />
            </button>
          </div>
          <h3>Mike Andrew</h3>
          <p>@michael24</p>
          <p>"{formData.aboutMe}"</p>
          <div className="social-links">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-google"></i>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
