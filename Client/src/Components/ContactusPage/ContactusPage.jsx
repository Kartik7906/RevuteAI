import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './ContactPage.css';

const ContactusPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceId = 'service_e3wphqs';
    const templateId = 'template_m8ao98k';
    const userId = '7YcnQZuizCdA4HVeN';

    emailjs
      .send(serviceId, templateId, formData, userId)
      .then(() => {
        alert('Your message has been sent successfully!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      })
      .catch((error) => {
        console.error('Failed to send the message', error);
        alert('Failed to send the message. Please try again.');
      });
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Get In Touch</h1>
      <p className="contact-subtitle">
        We provide a smart way to enhance your personality and soft skills through practice with AI.
        No worries—our AI will guide, support, and improve you at every step.
      </p>

      <div className="contact-content">
        <div className="contact-info">
          <h2 className="info-title">Contact Information</h2>
          <p className="info-text">
            We provide a smart way to enhance your personality and soft skills through practice
            with AI. No worries—our AI will guide, support, and improve you at every step.
          </p>
          <ul className="info-list">
            <li className="info-item">91+ 7906904795</li>
            <li className="info-item">91+ 7906904785</li>
            <li className="info-item">Support@revuteai.com</li>
            <li className="info-item">Hyderabad, India</li>
          </ul>
        </div>

        <div className="contact-form-section">
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name" className="input-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email" className="input-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="subject" className="input-label">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="I want to ask about..."
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <label htmlFor="message" className="input-label">Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Write here your message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactusPage;
