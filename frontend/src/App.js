import React, { useState } from 'react';
import Login from './components/Login';
import TaskList from './components/TaskList';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Vulnerable Task Manager (training app — do not deploy)</h1>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <>
          <p>Logged in as {user.username}</p>
          <TaskList userId={user._id} />
        </>
      )}
    </div>
  );
}
