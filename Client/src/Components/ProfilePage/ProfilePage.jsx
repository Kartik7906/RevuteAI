import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const updateProfile = () => {
    const formData = new FormData();
    formData.append('phone', userData.phone);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('userId', userId);

    fetch(`http://localhost:8000/api/profile/updateProfileInfo`, {
      method: 'PUT',
      body: formData,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Profile update failed');
        }
        setIsEditing(false);
        // Optionally, re-fetch profile data here to update profile picture preview
      })
      .catch(err => {
        setErrorMessage(err.message);
        console.error(err);
      });
  };

  const updatePassword = () => {
    fetch(`http://localhost:8000/api/profile/updatePassword/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Password update failed');
        }
        alert('Password updated successfully');
      })
      .catch(err => {
        setErrorMessage(err.message);
        console.error(err);
      });
  };

  useEffect(() => {
    fetch(`http://localhost:8000/api/profile/profileFetchUser/${userId}`)
      .then(response => response.json())
      .then(data =>
        setUserData(prev => ({
          ...prev,
          username: data.username,
          email: data.email,
          phone: data.phone || prev.phone,
          profileImage: data.profileImage || prev.profileImage,
        }))
      )
      .catch(err => console.error(err));
  }, [userId]);

  return (
    <div className="profile-page-container">
      <div className="profile-page-content">
        <h1 className="profile-Info-title">Profile Information</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="profile-picture-container">
          {userData.profileImage ? (
            <img
              src={`http://localhost:8000/uploads/${userData.profileImage}`}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-placeholder">No Image</div>
          )}
        </div>
        <div className="profile-fields">
          <div className="profile-field">
            <label className="profile-label">Username</label>
            <input
              name="username"
              value={userData.username}
              disabled
              className="profile-input"
              placeholder="Enter your username"
            />
          </div>
          <div className="profile-field">
            <label className="profile-label">Email</label>
            <input
              name="email"
              value={userData.email}
              disabled
              className="profile-input"
              placeholder="Enter your email"
            />
          </div>
          <div className="profile-field">
            <label className="profile-label">Phone</label>
            <input
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="profile-input"
              placeholder="Enter your phone"
            />
            {isEditing ? (
              <button onClick={updateProfile} className="profile-button">Save</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="profile-button">Edit</button>
            )}
          </div>
          <div className="profile-field">
            <label className="profile-label">Profile Picture</label>
            <input
              type="file"
              onChange={handleImageChange}
              disabled={!isEditing}
              className="profile-input"
            />
            {isEditing && profileImage && <span>{profileImage.name}</span>}
          </div>
        </div>
      </div>
      <div className="change-password-container">
        <h2 className="password-title">Change Password</h2>
        <div className="password-fields">
          <input
            className="profile-input"
            type="password"
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            placeholder="Old Password"
          />
          <input
            className="profile-input"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="New Password"
          />
          <input
            className="profile-input"
            type="password"
            name="confirmNewPassword"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm New Password"
          />
        </div>
        <button className="profile-button" onClick={updatePassword}>
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
