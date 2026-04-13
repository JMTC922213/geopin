import { useState } from 'react';
import './App.css';
import Login from './components/Auth/Login';
import Registration from './components/Auth/Registration';
import Logout from './components/Auth/Logout';
import Profile from './components/Auth/Profile';
import CombinedMap from './components/Map/CombinedMap';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setCurrentPage('map');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'register':
        return <Registration onNavigate={setCurrentPage} />;
      case 'logout':
        return <Logout onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile user={currentUser} onNavigate={setCurrentPage} />;
      case 'map':
        return (
          <div>
            <nav style={navStyle}>
              <div style={navContentStyle}>
                <h2 style={titleStyle}>Location App</h2>
                <div style={userInfoStyle}>
                  {currentUser && <span>Welcome, {currentUser.email}</span>}
                  <button onClick={() => setCurrentPage('profile')} style={profileButtonStyle}>
                    Profile
                  </button>
                  <button onClick={handleLogout} style={logoutButtonStyle}>
                    Logout
                  </button>
                </div>
              </div>
            </nav>
              <div style={mapContainerStyle}>
              <CombinedMap user={currentUser} />
            </div>
          </div>
        );
      default:
        return <Login onNavigate={setCurrentPage} onLogin={handleLogin} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
}

const navStyle = {
  backgroundColor: '#2c3e50',
  padding: '1rem 0',
  marginBottom: '0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const navContentStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const titleStyle = {
  color: 'white',
  margin: 0,
};

const userInfoStyle = {
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const profileButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};

const mapContainerStyle = {
  height: 'calc(100vh - 80px)',
  width: '100%',
};

export default App;
