import React, { useState, useEffect } from 'react';
import './SuperAdmin.css';

function SuperAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState(new Set());
  const [historyData, setHistoryData] = useState([]);
  const [adminScenarios, setAdminScenarios] = useState([]);
  const [userScenarios, setUserScenarios] = useState([]);

  const toggleForm = () => setShowForm(!showForm);

  const loadHistory = async () => {
    try {
      const response = await fetch('/history');
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadCurrentScenarios = async () => {
    try {
      const adminResponse = await fetch('/superadmin/current-admin-scenarios');
      const adminData = await adminResponse.json();
      setAdminScenarios(adminData);

      const userResponse = await fetch('/superadmin/current-user-scenarios');
      const userData = await userResponse.json();
      setUserScenarios(userData);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    }
  };

  useEffect(() => {
    loadHistory();
    loadCurrentScenarios();
  }, []);

  return (
    <div>
      <nav className="superadmin--navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="superadmin-container-fluid">
          <a className="superadmin-navbar-brand" href="#">
            <img src="https://via.placeholder.com/150x40.png?text=Logo" alt="Logo" height="40" />
            SuperAdmin Dashboard
          </a>
        </div>
      </nav>

      <div className="superadmin-container mt-5">
        <h1 className="superadmin-text-center mb-4">Admin Roleplay Dashboard</h1>

        <div className="superadmin-text-center mb-4">
          <button className="superadmin-btn btn-primary" onClick={toggleForm}>
            {showForm ? 'Hide Form' : 'Create New'}
          </button>
        </div>

        {showForm && (
          <div className="superadmin-card shadow p-4" id="form-container">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = {
                  scenario: e.target.scenario.value,
                  prompt: e.target.prompt.value,
                  question: e.target.question.value,
                };
                try {
                  const response = await fetch('/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                  });
                  const result = await response.json();
                  alert(result.message);
                  e.target.reset();
                  setShowForm(false);
                  loadHistory();
                } catch (err) {
                  console.error('Error submitting form:', err);
                }
              }}
            >
              <div className="superadmin-mb-3">
                <label htmlFor="scenario" className="superadmin-form-label">
                  Scenario
                </label>
                <input type="text" id="scenario" name="scenario" className="superadmin-form-control" required />
              </div>
              <div className="superadmin-mb-3">
                <label htmlFor="prompt" className="superadmin-form-label">
                  Prompt
                </label>
                <input type="text" id="prompt" name="prompt" className="superadmin-form-control" required />
              </div>
              <div className="superadmin-mb-3">
                <label htmlFor="question" className="superadmin-form-label">
                  Question
                </label>
                <input type="text" id="question" name="question" className="superadmin-form-control" required />
              </div>
              <button type="submit" className="superadmin-btn btn-primary w-100">
                Create Roleplay
              </button>
            </form>
          </div>
        )}

        <h2 className="superadmin-text-center mt-5">Roleplay History</h2>

        <table className="superadmin-table table-bordered mt-3">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Prompt</th>
              <th>Question</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item) => (
              <tr key={item._id}>
                <td>{item.scenario}</td>
                <td>{item.prompt}</td>
                <td>{item.question}</td>
                <td>{item.notification_sent ? 'Sent' : 'Not Sent'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="superadmin-text-center mt-5">Current Admin Scenarios</h2>

        <table className="superadmin-table table-bordered mt-3">
          <thead>
            <tr>
              <th>Scenario Name</th>
              <th>Approval Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminScenarios.map((item) => (
              <tr key={item._id}>
                <td>{item.scenario}</td>
                <td>{item.approval_date ? new Date(item.approval_date).toLocaleDateString() : 'N/A'}</td>
                <td>Visible to Admin</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="superadmin-text-center mt-5">Current User Scenarios</h2>

        <table className="superadmin-table table-bordered mt-3">
          <thead>
            <tr>
              <th>Scenario Name</th>
              <th>Approval Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userScenarios.map((item) => (
              <tr key={item._id}>
                <td>{item.scenario}</td>
                <td>{item.approval_date ? new Date(item.approval_date).toLocaleDateString() : 'N/A'}</td>
                <td>Visible to Users</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdmin;
