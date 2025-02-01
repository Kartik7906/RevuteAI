import React, { useState } from 'react';
import './ProfilePage.css';
import { FiUploadCloud } from "react-icons/fi";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: 'Kartik Kumar',
    email: 'kartik@example.com',
    phone: '+91 9876543210',
    address: '123 Main Street',
    city: 'New Delhi',
    college: 'Delhi University',
    bio: 'Passionate developer focused on creating meaningful user experiences.'
  });

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <div className='profile-page-container'>
      <div className='profile-page-content'>
        <h1 className='profile-Info-title'>Profile Information</h1>
      </div>

      <div className='profile-image-section'>
        <div className='profile-upload-section'>
          <div className='profile-image-wrapper'>
            <FiUploadCloud className='upload-icon' />
          </div>
        </div>
        <p className='UserName-section'>{userData.username}</p>
      </div>

      <div className='profile-elements'>
        <div className='profile-userInput'>
          {Object.keys(userData).map((key) => (
            key !== 'bio' && (
              <div key={key} className='profile-field'>
                <label className='profile-label'>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input
                  name={key}
                  value={userData[key]}
                  onChange={handleInputChange}
                  className={`profile-input ${!isEditing ? 'view-mode' : ''}`}
                  disabled={!isEditing}
                  placeholder={`Enter your ${key}`}
                />
              </div>
            )
          ))}
        </div>

        <div className='profile-userBio'>
          <div className='profile-field'>
            <label className='profile-label'>Bio</label>
            <textarea
              name='bio'
              value={userData.bio}
              onChange={handleInputChange}
              className={`profile-textarea ${!isEditing ? 'view-mode' : ''}`}
              disabled={!isEditing}
              placeholder='Enter your bio'
            />
          </div>
          <button 
            className='EditProfileInfo' 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className='ChanepasswordContainer'>
        <div className='Chanepassword'>
          <h2 className='password-title'>Change Password</h2>
          <div className='password-fields'>
            <input className='profile-input' type='password' placeholder='Old Password' />
            <input className='profile-input' type='password' placeholder='New Password' />
            <input className='profile-input' type='password' placeholder='Confirm New Password' />
          </div>
          <button className='profile-button'>Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;