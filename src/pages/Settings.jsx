import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import '../styles/settings.css';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Layout>
      <div className='mainSetting'>
        <h2>Settings</h2>

        {/* Dark Mode Option */}
        <div className="settings-option">
          <span>Dark Mode</span>
          <button onClick={toggleTheme}>
            {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
          </button>
        </div>

        {/* Change Password */}
        <div className="settings-option">
          <span>Change Password</span>
          <input type="password" placeholder="New Password" />
          <button>Save</button>
        </div>

        {/* Change Email Address */}
        <div className="settings-option">
          <span>Change Email</span>
          <input type="email" placeholder="New Email" />
          <button>Save</button>
        </div>

        {/* Change Username */}
        <div className="settings-option">
          <span>Change Username</span>
          <input type="text" placeholder="New Username" />
          <button>Save</button>
        </div>

        {/* Notifications Toggle */}
        <div className="settings-option">
          <span>Enable Notifications</span>
          <button>Enable</button>
        </div>

        {/* Language Selection */}
        <div className="settings-option">
          <span>Select Language</span>
          <select>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
          <button>Save</button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
