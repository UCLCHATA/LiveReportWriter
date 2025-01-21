import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <img className="footer-logo" src="/assets/ucl-logo.png" alt="UCL Logo" />
      <div className="footer-content">
        <p>&copy; 2024 CHATA Report Writing Form System</p>
        <p className="contact-text">Need help? Contact uclchata@gmail.com</p>
      </div>
      <img className="footer-logo" src="/assets/nhs-logo.png" alt="NHS Logo" />
    </footer>
  );
};

export default Footer; 