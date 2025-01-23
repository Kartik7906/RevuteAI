import React, { useState, useEffect } from 'react';
import './Admin.css'
const URL = "http://localhost:8000";

const Admin = () => {
  const [selectedScenarios, setSelectedScenarios] = useState(new Set());
  const [selectedUserScenarios, setSelectedUserScenarios] = useState(new Set());
  const [scenarios, setScenarios] = useState([]);
  const [userScenarios, setUserScenarios] = useState([]);

  useEffect(() => {
    loadScenarios();
    loadUserScenarios();
  }, []);

  //  const Scenarios = fetch('dbUrl')
 const loadScenarios = async () => {
  try {
    const response = await fetch('http://localhost:8000/admin/accepted-scenarios', {
      credentials: 'same-origin'  // Include credentials (cookies, authorization headers, etc.)
    });
    const data = await response.json();
    setScenarios(data);
  } catch (error) {
    console.error('Failed to load scenarios', error);
  }
};

const loadUserScenarios = async () => {
  try {
    const response = await fetch('http://localhost:8000/admin/current-user-scenarios', {
      credentials: 'same-origin'
    });
    const data = await response.json();
    setUserScenarios(data);
  } catch (error) {
    console.error('Failed to load user scenarios', error);
  }
};


  const toggleScenarioSelection = (id) => {
    setSelectedScenarios((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const toggleUserScenarioSelection = (id) => {
    setSelectedUserScenarios((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const sendToUsers = async () => {
    if (selectedScenarios.size === 0) {
      alert('Please select scenarios to send to users');
      return;
    }

    try {
      const response = await fetch('/admin/toggle_visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedScenarios), action: 'add' })
      });
      const data = await response.json();
      alert(data.message);
      setSelectedScenarios(new Set());
      loadScenarios();
    } catch (error) {
      console.error('Failed to update scenario visibility', error);
    }
  };

  const removeFromUsers = async () => {
    if (selectedUserScenarios.size === 0) {
      alert('Please select scenarios to remove from users');
      return;
    }

    try {
      const response = await fetch('/admin/toggle_visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedUserScenarios), action: 'remove' })
      });
      const data = await response.json();
      alert(data.message);
      setSelectedUserScenarios(new Set());
      loadUserScenarios();
    } catch (error) {
      console.error('Failed to remove scenarios from users', error);
    }
  };

  return (
    <div>
      <nav className="admin-navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="admin-container-fluid">
          <a className="admin-navbar-brand" href="#">
            <img src="https://via.placeholder.com/150x40.png?text=AdminLogo" alt="Logo" style={{ height: '40px' }} />
             Admin Dashboard
          </a>

                <a href="/" className="admin-btn btn-outline-light">Back to Home</a>
          
        </div>
      </nav>

      <div className="admin-container mt-5">
        <h1 className="admin-text-center mb-4"> Admin Dashboard</h1>

        {/* Available Scenarios */}
        <div className="admin-card shadow p-4 mb-5">
          <h2 className="admin-text-center mb-4">Available Scenarios</h2>

          {selectedScenarios.size > 0 && (
            <div className="admin-batch-actions visible">
              <span>{selectedScenarios.size} item(s) selected</span>
              <button className="admin-btn btn-success btn-sm ms-3" onClick={sendToUsers}>Send to Users</button>
            </div>
          )}

          <table className="admin-table table-bordered mt-3">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedScenarios(checked ? new Set(scenarios.map((s) => s._id)) : new Set());
                    }}
                  />
                </th>
                <th>Scenario</th>
                <th>Prompt</th>
                <th>Question</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario._id} className={scenario.visible_to_users ? 'admin-visible-row' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedScenarios.has(scenario._id)}
                      onChange={() => toggleScenarioSelection(scenario._id)}
                    />
                  </td>
                  <td>{scenario.scenario}</td>
                  <td>{scenario.prompt}</td>
                  <td>{scenario.question}</td>
                  <td>{scenario.visible_to_users ? 'Visible to Users' : 'Hidden from Users'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Current User Scenarios */}
        <div className="admin-card shadow p-4 mb-5">
          <h2 className="admin-text-center mb-4">Current User Scenarios</h2>

          {selectedUserScenarios.size > 0 && (
            <div className="admin-batch-actions visible">
              <span>{selectedUserScenarios.size} item(s) selected</span>
              <button className="admin-btn btn-danger btn-sm ms-3" onClick={removeFromUsers}>Remove from Users</button>
            </div>
          )}

          <table className="admin-table table-bordered mt-3">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedUserScenarios(checked ? new Set(userScenarios.map((u) => u._id)) : new Set());
                    }}
                  />
                </th>
                <th>Scenario</th>
                <th>Prompt</th>
                <th>Question</th>
                <th>Approval Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userScenarios.map((scenario) => (
                <tr key={scenario._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUserScenarios.has(scenario._id)}
                      onChange={() => toggleUserScenarioSelection(scenario._id)}
                    />
                  </td>
                  <td>{scenario.scenario}</td>
                  <td>{scenario.prompt}</td>
                  <td>{scenario.question}</td>
                  <td>{scenario.approval_date || 'N/A'}</td>
                  <td>
                    <button className="admin-btn btn-danger btn-sm" onClick={() => removeFromUsers(scenario._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
