// Admin.jsx
import React, { useState, useEffect } from 'react';
import './Admin.css';

const URL = "http://localhost:8000";

const Admin = () => {
  const [selectedScenarios, setSelectedScenarios] = useState(new Set());
  const [selectedUserScenarios, setSelectedUserScenarios] = useState(new Set());
  const [scenarios, setScenarios] = useState([]);
  const [userScenarios, setUserScenarios] = useState([]);
  const [modal, setModal] = useState({ isVisible: false, type: '', data: null });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: '' });

  const loadScenarios = async () => {
    try {
      const response = await fetch(`${URL}/admin/scenarios`, {
        credentials: 'same-origin'
      });
      const data = await response.json();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios', error);
      showToast('Failed to load scenarios', 'error');
    }
  };

  // Fetch Current User Scenarios
  const loadUserScenarios = async () => {
    try {
      const response = await fetch(`${URL}/admin/current-user-scenarios`, {
        credentials: 'same-origin'
      });
      const data = await response.json();
      setUserScenarios(data);
    } catch (error) {
      console.error('Failed to load user scenarios', error);
      showToast('Failed to load user scenarios', 'error');
    }
  };

  // Initial Data Load
  useEffect(() => {
    loadScenarios();
    loadUserScenarios();
  }, []);

  // Handle Checkbox Changes for Available Scenarios
  const handleScenarioCheckboxChange = (id) => {
    setSelectedScenarios(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Handle Select All for Available Scenarios
  const handleSelectAllScenarios = (e) => {
    if (e.target.checked) {
      setSelectedScenarios(new Set(scenarios.map(scenario => scenario._id)));
    } else {
      setSelectedScenarios(new Set());
    }
  };

  // Handle Checkbox Changes for User Scenarios
  const handleUserScenarioCheckboxChange = (id) => {
    setSelectedUserScenarios(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Handle Select All for User Scenarios
  const handleSelectAllUserScenarios = (e) => {
    if (e.target.checked) {
      setSelectedUserScenarios(new Set(userScenarios.map(scenario => scenario._id)));
    } else {
      setSelectedUserScenarios(new Set());
    }
  };

  // Batch Action: Send to Users
  const sendToUsers = async () => {
    if (selectedScenarios.size === 0) {
      showToast('Please select scenarios to send to users', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to send these scenarios to users? They will need to accept them before they appear in their dropdown.')) {
      return;
    }

    try {
      const response = await fetch(`${URL}/admin/toggle_visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: Array.from(selectedScenarios),
          action: 'add'
        })
      });
      const data = await response.json();
      if (data.error) {
        showToast(`Error: ${data.error}`, 'error');
      } else {
        showToast('Scenarios sent to users successfully', 'success');
        setSelectedScenarios(new Set());
        loadScenarios();
        loadUserScenarios();
      }
    } catch (error) {
      console.error('Failed to send scenarios to users', error);
      showToast('Failed to send scenarios to users', 'error');
    }
  };

  // Batch Action: Remove from Users
  const removeFromUsers = async () => {
    if (selectedUserScenarios.size === 0) {
      showToast('Please select scenarios to remove from users', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to remove these scenarios from user view?')) {
      return;
    }

    try {
      const response = await fetch(`${URL}/admin/toggle_visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: Array.from(selectedUserScenarios),
          action: 'remove'
        })
      });
      const data = await response.json();
      if (data.error) {
        showToast(`Error: ${data.error}`, 'error');
      } else {
        showToast('Scenarios removed from users successfully', 'success');
        setSelectedUserScenarios(new Set());
        loadUserScenarios();
      }
    } catch (error) {
      console.error('Failed to remove scenarios from users', error);
      showToast('Failed to remove scenarios from users', 'error');
    }
  };

  // Batch Action: Delete Selected Scenarios
  const deleteSelectedScenarios = () => {
    setModal({ isVisible: true, type: 'batchDelete', data: Array.from(selectedScenarios) });
  };

  // Single Scenario Deletion
  const deleteScenario = (id) => {
    setModal({ isVisible: true, type: 'singleDelete', data: id });
  };

  // Confirm Deletion
  const confirmDelete = async () => {
    if (modal.type === 'singleDelete') {
      const scenarioId = modal.data;
      try {
        const response = await fetch(`${URL}/admin/delete_scenario/${scenarioId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          showToast('Scenario removed successfully', 'success');
          setModal({ isVisible: false, type: '', data: null });
          loadScenarios();
          loadUserScenarios();
        } else {
          showToast(`Failed to remove scenario: ${data.message || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        console.error('Failed to remove scenario', error);
        showToast('Failed to remove scenario', 'error');
      }
    } else if (modal.type === 'batchDelete') {
      const scenarioIds = modal.data;
      try {
        const deletePromises = scenarioIds.map(id =>
          fetch(`${URL}/admin/delete_scenarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [id] })
          }).then(res => res.json())
        );
        const results = await Promise.all(deletePromises);
        const successCount = results.filter(result => result.success).length;
        const errorCount = results.length - successCount;

        if (successCount > 0) {
          showToast(`Successfully removed ${successCount} scenario(s)`, 'success');
        }
        if (errorCount > 0) {
          showToast(`Failed to remove ${errorCount} scenario(s)`, 'error');
        }

        setModal({ isVisible: false, type: '', data: null });
        setSelectedScenarios(new Set());
        loadScenarios();
        loadUserScenarios();
      } catch (error) {
        console.error('Failed to delete scenarios', error);
        showToast('Failed to delete scenarios', 'error');
      }
    }
  };

  // Cancel Deletion
  const cancelDelete = () => {
    setModal({ isVisible: false, type: '', data: null });
  };

  // Show Toast Notification
  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast({ isVisible: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-navbar-container">
          <a className="admin-navbar-brand" href="#">
            <img src="https://via.placeholder.com/150x40.png?text=AdminLogo" alt="Logo" />
            Admin Dashboard
          </a>
          <div className="admin-button-group">
            <a href="/" className="admin-btn admin-btn-outline">Back to Home</a>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="admin-container">
        <h1 className="admin-header">Admin Dashboard</h1>

        {/* Available Scenarios */}
        <div className="admin-card">
          <h2 className="admin-section-title">Available Scenarios</h2>

          {/* Batch Actions Bar */}
          {selectedScenarios.size > 0 && (
            <div className="admin-batch-actions visible">
              <div className="admin-batch-actions-container">
                <span>{selectedScenarios.size} item{selectedScenarios.size > 1 ? 's' : ''} selected</span>
                <div>
                  <button className="admin-btn admin-btn-success admin-btn-sm me-2" onClick={sendToUsers}>
                    Send to Users
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={deleteSelectedScenarios}>
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scenarios Table */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={selectedScenarios.size === scenarios.length && scenarios.length > 0}
                    onChange={handleSelectAllScenarios}
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
              {scenarios.map((scenario) => (
                <tr key={scenario._id} className={scenario.visible_to_users ? 'admin-visible-row' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={selectedScenarios.has(scenario._id)}
                      onChange={() => handleScenarioCheckboxChange(scenario._id)}
                    />
                  </td>
                  <td>{scenario.scenario}</td>
                  <td>{scenario.prompt}</td>
                  <td>{scenario.question}</td>
                  <td>{scenario.visible_to_users ? 'Visible to Users' : 'Hidden from Users'}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn-success admin-btn-sm me-2"
                      onClick={() => sendToUsers(scenario._id)}
                      disabled={scenario.visible_to_users}
                    >
                      {scenario.visible_to_users ? 'Sent' : 'Send to Users'}
                    </button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => deleteScenario(scenario._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Current User Scenarios */}
        <div className="admin-card">
          <h2 className="admin-section-title">Current User Scenarios</h2>

          {/* Batch Actions Bar */}
          {selectedUserScenarios.size > 0 && (
            <div className="admin-batch-actions visible">
              <div className="admin-batch-actions-container">
                <span>{selectedUserScenarios.size} item{selectedUserScenarios.size > 1 ? 's' : ''} selected</span>
                <div>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={removeFromUsers}>
                    Remove from Users
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Scenarios Table */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={selectedUserScenarios.size === userScenarios.length && userScenarios.length > 0}
                    onChange={handleSelectAllUserScenarios}
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
                      className="admin-checkbox"
                      checked={selectedUserScenarios.has(scenario._id)}
                      onChange={() => handleUserScenarioCheckboxChange(scenario._id)}
                    />
                  </td>
                  <td>{scenario.scenario}</td>
                  <td>{scenario.prompt}</td>
                  <td>{scenario.question}</td>
                  <td>{scenario.approval_date ? new Date(scenario.approval_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => deleteScenario(scenario._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modal.isVisible && (
        <div className="admin-modal-overlay" onClick={cancelDelete}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h5 className="admin-modal-title">Confirm {modal.type === 'batchDelete' ? 'Deletion' : 'Action'}</h5>
              <button className="admin-close-button" onClick={cancelDelete}>&times;</button>
            </div>
            <div className="admin-modal-body">
              {modal.type === 'batchDelete' && (
                <p>Are you sure you want to delete {modal.data.length} selected scenario{modal.data.length > 1 ? 's' : ''}?</p>
              )}
              {modal.type === 'singleDelete' && (
                <p>Are you sure you want to delete this scenario?</p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>
                {modal.type.includes('Delete') ? 'Delete' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.isVisible && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Admin;
