import { useState, useEffect } from 'react';

function Registration({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time email validation
  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email format');
    } else {
      setEmailError('');
    }
  }, [email]);

  // Real-time password validation
  useEffect(() => {
    if (password) {
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
      } else if (password.length > 20) {
        setPasswordError('Password must be at most 20 characters long');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Real-time confirm password validation
  useEffect(() => {
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  // Real-time nickname validation
  useEffect(() => {
    if (nickname === '') {
      setNicknameError('Nickname is required');
    } else if (nickname.length > 20) {
      setNicknameError('Nickname must be at most 20 characters');
    } else {
      setNicknameError('');
    }
  }, [nickname]);





  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there are any validation errors
    if (emailError || passwordError || confirmPasswordError || nicknameError) {
      alert('Please fix all validation errors before submitting');
      return;
    }
    
    // Basic validation
    if (!email || !password || !confirmPassword || !nickname) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:53840/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await response.json();
      
      if (data.return_message === 'Registration successful') {
        alert('Registration successful! Please login.');
        onNavigate('login'); // Redirect to login page
      } else {
        alert(data.return_message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Registration Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nickname">Nickname:</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength="20"
          />
          {nicknameError && <div className="error-message">{nicknameError}</div>}
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailError && <div className="error-message">{emailError}</div>}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {passwordError && <div className="error-message">{passwordError}</div>}
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
        </div>
        <button type="submit">Register</button>
        <button type="button" onClick={() => onNavigate('login')} className="secondary-btn">
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default Registration;