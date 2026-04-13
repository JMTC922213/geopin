import { useState } from 'react';

function Logout({ onLogout }) {
  const handleLogout = () => {
    onLogout();
  };

  return (
    <div>
      <h2>Welcome!</h2>
      <h3>You have successfully logged in.</h3>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default Logout;