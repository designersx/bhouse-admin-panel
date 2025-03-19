import { useTheme } from '../context/ThemeContext';
import '../styles/components.css';

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="navbar">
      <input type="text" placeholder="Search..." />
      <button onClick={toggleTheme}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </div>
  );
};

export default Navbar;
