import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username,
      password,
    });

    // VULN (CWE-922): JWT stored in localStorage, readable by any script on
    // the page — a single XSS bug anywhere in the app (see TaskList.js)
    // turns into full session theft. An httpOnly cookie doesn't have this
    // problem.
    localStorage.setItem('token', res.data.token);
    onLogin(res.data.user);
  };

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Log in</button>
    </form>
  );
}
