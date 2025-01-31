import React, { useState } from 'react';
import { 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaUser, 
  FaEdit, 
  FaUpload,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  // Initial user data
  const [user, setUser] = useState({
    fullName: 'John Doe',
    college: 'XYZ University',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'A passionate developer with expertise in React and web development.',
    linkedin: 'https://www.linkedin.com/in/johndoe',
    profilePhoto: 'https://via.placeholder.com/150', // Default profile photo
  });

  // Toggle between view and edit modes
  const [isEditing, setIsEditing] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({ ...user });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle profile photo upload
  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ 
        ...formData, 
        profilePhoto: URL.createObjectURL(e.target.files[0]) 
      });
    }
  };

  // Handle form submission
  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...formData });
    setIsEditing(false);
    // Here you would also handle updating the data in your backend
  };

  // Handle canceling edit
  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <h2 className="profile-heading">User Profile</h2>
      <div className="profile-card">
        <div className="profile-photo-section">
          <img
            src={isEditing ? formData.profilePhoto : user.profilePhoto}
            alt="Profile"
            className="profile-photo"
          />
          {!isEditing && (
            <button 
              className="profile-btn profile-btn-secondary profile-btn-upload"
              onClick={() => document.getElementById('photo-upload').click()}
            >
              <FaUpload /> Upload Photo
            </button>
          )}
          {isEditing && (
            <>
              <label 
                htmlFor="photo-upload" 
                className="profile-btn profile-btn-secondary profile-btn-upload"
              >
                <FaUpload /> Change Photo
              </label>
              <input
                type="file"
                id="photo-upload"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </>
          )}
        </div>

        <div className="profile-info-section">
          {!isEditing ? (
            <>
              <div className="profile-info-item">
                <FaUser className="profile-icon" />
                <div className="profile-info-text">
                  <h3>Full Name</h3>
                  <p>{user.fullName}</p>
                </div>
              </div>
              <div className="profile-info-item">
                <FaUniversity className="profile-icon" />
                <div className="profile-info-text">
                  <h3>College</h3>
                  <p>{user.college}</p>
                </div>
              </div>
              <div className="profile-info-item">
                <FaEnvelope className="profile-icon" />
                <div className="profile-info-text">
                  <h3>Email</h3>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="profile-info-item">
                <FaPhone className="profile-icon" />
                <div className="profile-info-text">
                  <h3>Phone</h3>
                  <p>{user.phone}</p>
                </div>
              </div>
              <div className="profile-info-item">
                <FaLinkedin className="profile-icon" />
                <div className="profile-info-text">
                  <h3>LinkedIn</h3>
                  <a 
                    href={user.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="profile-link"
                  >
                    {user.linkedin}
                  </a>
                </div>
              </div>
              <div className="profile-info-item bio">
                <h3>Bio</h3>
                <p>{user.bio}</p>
              </div>
              <button 
                className="profile-btn profile-btn-edit-profile"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> Edit Profile
              </button>
            </>
          ) : (
            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="profile-form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="college">College</label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  required
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="linkedin">LinkedIn URL</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  required
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  className="profile-textarea"
                ></textarea>
              </div>
              <div className="profile-form-actions">
                <button 
                  type="submit" 
                  className="profile-btn profile-btn-primary"
                >
                  <FaSave /> Save
                </button>
                <button 
                  type="button" 
                  className="profile-btn profile-btn-danger" 
                  onClick={handleCancel}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
