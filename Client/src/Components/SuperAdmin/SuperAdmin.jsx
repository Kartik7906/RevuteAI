// SuperAdmin.js
import React, { useState, useEffect } from 'react';
import './SuperAdmin.css';

const URL = "http://localhost:8000";

function SuperAdmin() {
  // State Hooks
  const [showForm, setShowForm] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState(new Set());
  const [selectedAdminScenarios, setSelectedAdminScenarios] = useState(new Set());
  const [selectedUserScenarios, setSelectedUserScenarios] = useState(new Set());
  const [historyData, setHistoryData] = useState([]);
  const [adminScenarios, setAdminScenarios] = useState([]);
  const [userScenarios, setUserScenarios] = useState([]);
  const [modal, setModal] = useState({ isVisible: false, type: '', data: null });

  // Toggle the visibility of the creation form
  const toggleForm = () => setShowForm(!showForm);

  // Fetch Roleplay History
  const loadHistory = async () => {
    try {
      const response = await fetch(`${URL}/history`, { credentials: 'same-origin' });
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error('Error loading history:', error);
      alert('Failed to load scenarios');
    }
  };

  // Fetch Current Admin and User Scenarios
  const loadCurrentScenarios = async () => {
    try {
      const adminResponse = await fetch(`${URL}/superadmin/current-admin-scenarios`, { credentials: 'same-origin' });
      const adminData = await adminResponse.json();
      setAdminScenarios(adminData);

      const userResponse = await fetch(`${URL}/superadmin/current-user-scenarios`, { credentials: 'same-origin' });
      const userData = await userResponse.json();
      setUserScenarios(userData);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      alert('Failed to load scenarios');
    }
  };

  // Initial Data Load
  useEffect(() => {
    loadHistory();
    loadCurrentScenarios();
  }, []);

  // Handle Form Submission to Create New Scenario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      scenario: e.target.scenario.value,
      prompt: e.target.prompt.value,
      question: e.target.question.value,
    };
    try {
      const response = await fetch(`${URL}/create`, {
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
      alert('Failed to create scenario');
    }
  };

  // Handle Checkbox Changes for History Table
  const handleCheckboxChange = (id) => {
    const updatedSelected = new Set(selectedScenarios);
    if (updatedSelected.has(id)) {
      updatedSelected.delete(id);
    } else {
      updatedSelected.add(id);
    }
    setSelectedScenarios(updatedSelected);
  };

  // Handle Select All in History Table
  const handleSelectAll = () => {
    if (selectedScenarios.size === historyData.length) {
      setSelectedScenarios(new Set());
    } else {
      setSelectedScenarios(new Set(historyData.map(item => item._id)));
    }
  };

  // Handle Batch Actions for History
  const sendToUsers = async () => {
    if (selectedScenarios.size === 0) {
      alert('Please select scenarios to send to users');
      return;
    }

    if (!window.confirm('Are you sure you want to send these scenarios to users? They will need to accept them before they appear in their dropdown.')) {
      return;
    }

    try {
      const response = await fetch(`${URL}/superadmin/toggle_user_visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: Array.from(selectedScenarios),
          action: 'add'
        })
      });
      const data = await response.json();
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert('Notifications sent to users successfully. Users will need to accept the scenarios.');
        setSelectedScenarios(new Set());
        loadHistory();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send notifications to users');
    }
  };

  const sendToAdmin = async () => {
    if (selectedScenarios.size === 0) {
      alert('Please select scenarios to send to admin');
      return;
    }

    try {
      const response = await fetch(`${URL}/toggle_admin_visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedScenarios) })
      });
      const data = await response.json();
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message);
        setSelectedScenarios(new Set());
        loadHistory();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update scenario visibility for admin');
    }
  };

  const deleteSelectedScenarios = () => {
    setModal({ isVisible: true, type: 'batchDelete', data: Array.from(selectedScenarios) });
  };

  const deleteScenario = (id) => {
    setModal({ isVisible: true, type: 'singleDelete', data: id });
  };

  const confirmDelete = async () => {
    if (modal.type === 'singleDelete') {
      try {
        const response = await fetch(`${URL}/delete/${modal.data}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.message) {
          alert(data.message);
          setModal({ isVisible: false, type: '', data: null });
          loadHistory();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete scenario');
      }
    } else if (modal.type === 'batchDelete') {
      try {
        const deletePromises = modal.data.map(id =>
          fetch(`${URL}/delete/${id}`, { method: 'DELETE' }).then(res => res.json())
        );
        await Promise.all(deletePromises);
        alert('Selected scenarios deleted successfully');
        setModal({ isVisible: false, type: '', data: null });
        setSelectedScenarios(new Set());
        loadHistory();
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete some scenarios');
      }
    }
  };

  const cancelDelete = () => {
    setModal({ isVisible: false, type: '', data: null });
  };

  // Handle Checkbox Changes for Admin Scenarios
  const handleAdminCheckboxChange = (id) => {
    const updatedSelected = new Set(selectedAdminScenarios);
    if (updatedSelected.has(id)) {
      updatedSelected.delete(id);
    } else {
      updatedSelected.add(id);
    }
    setSelectedAdminScenarios(updatedSelected);
  };

  const handleAdminSelectAll = () => {
    if (selectedAdminScenarios.size === adminScenarios.length) {
      setSelectedAdminScenarios(new Set());
    } else {
      setSelectedAdminScenarios(new Set(adminScenarios.map(item => item._id)));
    }
  };

  const removeFromAdmin = async () => {
    if (selectedAdminScenarios.size === 0) {
      alert('Please select scenarios to remove');
      return;
    }

    if (!window.confirm('Are you sure you want to remove these scenarios from admin view? This will also remove them from user view if present.')) {
      return;
    }

    try {
      const response = await fetch(`${URL}/superadmin/toggle_admin_visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: Array.from(selectedAdminScenarios),
          action: 'remove'
        })
      });
      const data = await response.json();
      alert(data.message);
      setSelectedAdminScenarios(new Set());
      loadCurrentScenarios();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove scenarios');
    }
  };

  // Handle Checkbox Changes for User Scenarios
  const handleUserCheckboxChange = (id) => {
    const updatedSelected = new Set(selectedUserScenarios);
    if (updatedSelected.has(id)) {
      updatedSelected.delete(id);
    } else {
      updatedSelected.add(id);
    }
    setSelectedUserScenarios(updatedSelected);
  };

  const handleUserSelectAll = () => {
    if (selectedUserScenarios.size === userScenarios.length) {
      setSelectedUserScenarios(new Set());
    } else {
      setSelectedUserScenarios(new Set(userScenarios.map(item => item._id)));
    }
  };

  const removeFromUsers = async () => {
    if (selectedUserScenarios.size === 0) {
      alert('Please select scenarios to remove');
      return;
    }

    if (!window.confirm('Are you sure you want to remove these scenarios from user view?')) {
      return;
    }

    try {
      const response = await fetch(`${URL}/superadmin/toggle_user_visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: Array.from(selectedUserScenarios),
          action: 'remove'
        })
      });
      const data = await response.json();
      alert(data.message);
      setSelectedUserScenarios(new Set());
      loadCurrentScenarios();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove scenarios');
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="superadmin-navbar">
        <div className="superadmin-navbar-container">
          <a className="superadmin-navbar-brand" href="#">
            <img src="https://via.placeholder.com/150x40.png?text=Logo" alt="Logo" />
            SuperAdmin Dashboard
          </a>
        </div>
      </nav>

      {/* Main Container */}
      <div className="superadmin-container">
        {/* Header */}
        <h1 className="superadmin-text-center superadmin-header">Admin Roleplay Dashboard</h1>

        {/* Create New Button */}
        <div className="superadmin-text-center superadmin-button-container">
          <button className="superadmin-btn superadmin-btn-primary" onClick={toggleForm}>
            {showForm ? 'Hide Form' : 'Create New'}
          </button>
        </div>

        {/* Create New Form */}
        {showForm && (
          <div className="superadmin-card">
            <form onSubmit={handleFormSubmit}>
              <div className="superadmin-form-group">
                <label htmlFor="scenario" className="superadmin-form-label">Scenario</label>
                <input type="text" id="scenario" name="scenario" className="superadmin-form-control" required />
              </div>
              <div className="superadmin-form-group">
                <label htmlFor="prompt" className="superadmin-form-label">Prompt</label>
                <input type="text" id="prompt" name="prompt" className="superadmin-form-control" required />
              </div>
              <div className="superadmin-form-group">
                <label htmlFor="question" className="superadmin-form-label">Question</label>
                <input type="text" id="question" name="question" className="superadmin-form-control" required />
              </div>
              <button type="submit" className="superadmin-btn superadmin-btn-primary superadmin-btn-full-width">Create Roleplay</button>
            </form>
          </div>
        )}

        {/* Roleplay History */}
        <h2 className="superadmin-section-title">Roleplay History</h2>

        {/* Batch Actions Bar */}
        {selectedScenarios.size > 0 && (
          <div className="superadmin-batch-actions visible">
            <div className="superadmin-batch-actions-container">
              <span>{selectedScenarios.size} item{selectedScenarios.size > 1 ? 's' : ''} selected</span>
              <div>
                <button className="superadmin-btn superadmin-btn-primary superadmin-btn-sm me-2" onClick={sendToAdmin}>
                  Send to Admin
                </button>
                <button className="superadmin-btn superadmin-btn-success superadmin-btn-sm me-2" onClick={sendToUsers}>
                  Send to Users
                </button>
                <button className="superadmin-btn superadmin-btn-danger superadmin-btn-sm" onClick={deleteSelectedScenarios}>
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <table className="superadmin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedScenarios.size === historyData.length && historyData.length > 0}
                  onChange={handleSelectAll}
                  className="superadmin-checkbox"
                />
              </th>
              <th>Scenario</th>
              <th>Prompt</th>
              <th>Question</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map(item => (
              <tr key={item._id} className={item.fadeOut ? 'superadmin-fade-out' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedScenarios.has(item._id)}
                    onChange={() => handleCheckboxChange(item._id)}
                    className="superadmin-checkbox"
                  />
                </td>
                <td>{item.scenario}</td>
                <td>{item.prompt}</td>
                <td>{item.question}</td>
                <td>
                  {item.notification_sent
                    ? 'Notification Sent'
                    : item.visible_to_users
                    ? 'Accepted by User'
                    : 'Not Sent'}
                </td>
                <td>
                  <button className="superadmin-btn superadmin-btn-warning superadmin-btn-sm me-2">Edit</button>
                  <button
                    className="superadmin-btn superadmin-btn-success superadmin-btn-sm me-2"
                    onClick={() => {
                      if (item.notification_sent) {
                        alert('Notification already sent');
                      } else {
                        setModal({ isVisible: true, type: 'sendToUsers', data: item._id });
                      }
                    }}
                    disabled={item.notification_sent}
                  >
                    {item.notification_sent ? 'Notification Sent' : 'Send to Users'}
                  </button>
                  <button className="superadmin-btn superadmin-btn-danger superadmin-btn-sm" onClick={() => deleteScenario(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Current Admin Scenarios */}
        <h2 className="superadmin-section-title">Current Admin Scenarios</h2>

        {/* Admin Batch Actions Bar */}
        {selectedAdminScenarios.size > 0 && (
          <div className="superadmin-batch-actions visible">
            <div className="superadmin-batch-actions-container">
              <span>{selectedAdminScenarios.size} item{selectedAdminScenarios.size > 1 ? 's' : ''} selected</span>
              <div>
                <button className="superadmin-btn superadmin-btn-danger superadmin-btn-sm me-2" onClick={removeFromAdmin}>
                  Remove from Admin View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Scenarios Table */}
        <table className="superadmin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedAdminScenarios.size === adminScenarios.length && adminScenarios.length > 0}
                  onChange={handleAdminSelectAll}
                  className="superadmin-checkbox"
                />
              </th>
              <th>Scenario Name</th>
              <th>Approval Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminScenarios.map(item => (
              <tr key={item._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedAdminScenarios.has(item._id)}
                    onChange={() => handleAdminCheckboxChange(item._id)}
                    className="superadmin-checkbox"
                  />
                </td>
                <td>{item.scenario}</td>
                <td>{item.approval_date ? new Date(item.approval_date).toLocaleDateString() : 'N/A'}</td>
                <td>Visible to Admin</td>
                <td>
                  <button className="superadmin-btn superadmin-btn-danger superadmin-btn-sm" onClick={() => {
                    setModal({ isVisible: true, type: 'removeFromAdmin', data: item._id });
                  }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Current User Scenarios */}
        <h2 className="superadmin-section-title">Current User Scenarios</h2>

        {/* User Batch Actions Bar */}
        {selectedUserScenarios.size > 0 && (
          <div className="superadmin-batch-actions visible">
            <div className="superadmin-batch-actions-container">
              <span>{selectedUserScenarios.size} item{selectedUserScenarios.size > 1 ? 's' : ''} selected</span>
              <div>
                <button className="superadmin-btn superadmin-btn-danger superadmin-btn-sm me-2" onClick={removeFromUsers}>
                  Remove from User View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Scenarios Table */}
        <table className="superadmin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUserScenarios.size === userScenarios.length && userScenarios.length > 0}
                  onChange={handleUserSelectAll}
                  className="superadmin-checkbox"
                />
              </th>
              <th>Scenario Name</th>
              <th>Approval Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userScenarios.map(item => (
              <tr key={item._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUserScenarios.has(item._id)}
                    onChange={() => handleUserCheckboxChange(item._id)}
                    className="superadmin-checkbox"
                  />
                </td>
                <td>{item.scenario}</td>
                <td>{item.approval_date ? new Date(item.approval_date).toLocaleDateString() : 'N/A'}</td>
                <td>Visible to Users</td>
                <td>
                  <button className="superadmin-btn superadmin-btn-danger superadmin-btn-sm" onClick={() => {
                    setModal({ isVisible: true, type: 'removeFromUsers', data: item._id });
                  }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {modal.isVisible && (
        <div className="superadmin-modal-overlay" onClick={cancelDelete}>
          <div className="superadmin-modal" onClick={e => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h5 className="superadmin-modal-title">Confirm {modal.type === 'batchDelete' ? 'Deletion' : 'Action'}</h5>
              <button className="superadmin-close-button" onClick={cancelDelete}>&times;</button>
            </div>
            <div className="superadmin-modal-body">
              {modal.type === 'batchDelete' && (
                <p>Are you sure you want to delete {modal.data.length} selected scenario{modal.data.length > 1 ? 's' : ''}?</p>
              )}
              {modal.type === 'singleDelete' && (
                <p>Are you sure you want to delete this scenario?</p>
              )}
              {modal.type === 'removeFromAdmin' && (
                <p>Are you sure you want to remove this scenario from admin view? This will also remove it from user view if present.</p>
              )}
              {modal.type === 'removeFromUsers' && (
                <p>Are you sure you want to remove this scenario from user view?</p>
              )}
            </div>
            <div className="superadmin-modal-footer">
              <button className="superadmin-btn superadmin-btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="superadmin-btn superadmin-btn-danger" onClick={confirmDelete}>
                {modal.type.includes('remove') ? 'Remove' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdmin;
