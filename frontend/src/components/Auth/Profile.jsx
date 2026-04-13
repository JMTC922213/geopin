import { useState, useEffect } from 'react';

function Profile({ user, onNavigate }) {
  const [profile, setProfile] = useState({
    username: '',
    age: '',
    bio: '',
    profileImage: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load existing profile on mount
  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`http://localhost:53840/profile/${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile({
            username: data.username || '',
            age: data.age || '',
            bio: data.bio || '',
            profileImage: data.profileImage || '',
            phone: data.phone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:53840/profile/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          age: profile.age ? parseInt(profile.age) : 0
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>My Profile</h2>

        {/* Profile Display Mode */}
        {!isEditing && (
          <div style={displayModeStyle}>
            <div style={profileHeaderStyle}>
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  style={profileImageStyle}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                />
              ) : (
                <div style={profileImagePlaceholderStyle}>
                  {user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div style={profileInfoStyle}>
                <h3 style={usernameStyle}>{profile.username || 'No username set'}</h3>
                <p style={emailStyle}>{user?.email}</p>
              </div>
            </div>

            <div style={profileDetailsStyle}>
              <div style={detailRowStyle}>
                <strong>Age:</strong> <span>{profile.age || 'Not specified'}</span>
              </div>
              <div style={detailRowStyle}>
                <strong>Phone:</strong> <span>{profile.phone || 'Not specified'}</span>
              </div>
              <div style={detailRowStyle}>
                <strong>Bio:</strong>
                <p style={bioTextStyle}>{profile.bio || 'No bio added yet'}</p>
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <button onClick={() => setIsEditing(true)} style={editButtonStyle}>
                Edit Profile
              </button>
              <button onClick={() => onNavigate('map')} style={backButtonStyle}>
                Back to Map
              </button>
            </div>
          </div>
        )}

        {/* Profile Edit Mode */}
        {isEditing && (
          <form onSubmit={handleSubmit} style={formStyle}>
            {message && (
              <div style={message.includes('success') ? successMessageStyle : errorMessageStyle}>
                {message}
              </div>
            )}

            <div style={formGroupStyle}>
              <label style={labelStyle}>Username (Text)</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="Enter your username"
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Age (Number)</label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                placeholder="Enter your age"
                min="0"
                max="150"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Phone Number (Text)</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+852 1234 5678"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Profile Image URL (Text/URL)</label>
              <input
                type="url"
                name="profileImage"
                value={profile.profileImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                style={inputStyle}
              />
              {profile.profileImage && (
                <img
                  src={profile.profileImage}
                  alt="Preview"
                  style={imagePreviewStyle}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Bio (Text)</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="4"
                style={textareaStyle}
              />
            </div>

            <div style={buttonGroupStyle}>
              <button type="submit" disabled={loading} style={submitButtonStyle}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  padding: '40px',
  width: '100%',
  maxWidth: '600px',
};

const titleStyle = {
  textAlign: 'center',
  color: '#333',
  marginBottom: '30px',
  fontSize: '28px',
};

const displayModeStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
};

const profileHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  paddingBottom: '20px',
  borderBottom: '2px solid #eee',
};

const profileImageStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid #3498db',
};

const profileImagePlaceholderStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: '#3498db',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '40px',
  fontWeight: 'bold',
};

const profileInfoStyle = {
  flex: 1,
};

const usernameStyle = {
  margin: '0 0 5px 0',
  color: '#333',
  fontSize: '24px',
};

const emailStyle = {
  margin: 0,
  color: '#666',
  fontSize: '14px',
};

const profileDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const detailRowStyle = {
  display: 'flex',
  gap: '10px',
  fontSize: '16px',
  color: '#555',
};

const bioTextStyle = {
  marginTop: '5px',
  color: '#666',
  lineHeight: '1.6',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#555',
  fontSize: '14px',
};

const inputStyle = {
  padding: '12px',
  fontSize: '16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  outline: 'none',
  transition: 'border-color 0.3s',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
};

const imagePreviewStyle = {
  marginTop: '10px',
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '2px solid #ddd',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '10px',
};

const editButtonStyle = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const backButtonStyle = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const submitButtonStyle = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const cancelButtonStyle = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const successMessageStyle = {
  padding: '12px',
  backgroundColor: '#d4edda',
  color: '#155724',
  borderRadius: '4px',
  border: '1px solid #c3e6cb',
};

const errorMessageStyle = {
  padding: '12px',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '4px',
  border: '1px solid #f5c6cb',
};

export default Profile;
