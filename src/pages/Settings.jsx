import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import '../styles/settings.css';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Layout>
      <div className='mainSetting'>
        <h2 className="settings-title">Settings</h2>

        <div className="settings-group">
          <div className="settings-label">
            <span>Dark Mode</span>
          </div>
          <div className="settings-control">
            <button onClick={toggleTheme}>
              {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
            </button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-label">
            <span>Change Password</span>
            <input type="password" placeholder="New Password" />
          </div>
          <div className="settings-control">
            <button>Save</button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-label">
            <span>Change Email</span>
            <input type="email" placeholder="New Email" />
          </div>
          <div className="settings-control">
            <button>Save</button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-label">
            <span>Change Username</span>
            <input type="text" placeholder="New Username" />
          </div>
          <div className="settings-control">
            <button>Save</button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-label">
            <span>Enable Notifications</span>
          </div>
          <div className="settings-control">
            <button>Enable</button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-label">
            <span>Select Language</span>
            <select>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="settings-control">
            <button>Save</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
