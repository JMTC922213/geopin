import { useState } from 'react';

function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:53840/auth", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email:email, password:password})
    })
    .then(r => r.json())
    .then(r => {
        if ('success' === r.message) {
            window.alert("Login successful")
            onLogin({ email: email }); // Pass user data to parent
        } else {
            window.alert(r.message)
        }
    })

  };

  return (
    <div className="App">
      <h1>Home Page and Login Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br/>
        <button type="submit">Login</button>
        <button type="button" onClick={() => onNavigate('register')} className="secondary-btn">
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;