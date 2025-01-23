import React, { useState } from 'react';
import emailjs from 'emailjs-com'; 
import './ContactPage.css';

const ContactusPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phoneNumber: '',
    discussion: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Replace these with your EmailJS credentials
    const serviceId = 'service_e3wphqs'; // Enclose in quotes
    const templateId = 'template_m8ao98k'; // Enclose in quotes
    const userId = '7YcnQZuizCdA4HVeN'; // Enclose in quotes


    emailjs
      .send(serviceId, templateId, formData, userId)
      .then(() => {
        alert('Your message has been sent successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          country: '',
          phoneNumber: '',
          discussion: '',
        });
      })
      .catch((error) => {
        console.error('Failed to send the message', error);
        alert('Failed to send the message. Please try again.');
      });
  };

  return (
    <div className="contact-page">
      <div className="contact-left">
        <h2>Get In Touch</h2>
        <p>We'd love to hear from you. Fill out the form, and we'll get back to you shortly!</p>
      </div>
      <div className="contact-right">
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          <textarea
            name="discussion"
            placeholder="What do you want to discuss?"
            value={formData.discussion}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ContactusPage;
