import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import '../styles/settings.css';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Layout>
      <h2>Settings</h2>
      <div className="settings-option">
        <span>Dark Mode</span>
        <button onClick={toggleTheme}>
          {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
        </button>
      </div>
      <div className="settings-option">
        <span>Change Password</span>
        <input type="password" placeholder="New Password" />
        <button>Save</button>
      </div>
    </Layout>
  );
};

export default Settings;
