import React from 'react';

const SpinnerLoader = ({ size = 40 }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: '4px solid #ccc',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return <div style={spinnerStyle} />;
};

// Add keyframes to the document once
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);

export default SpinnerLoader;
