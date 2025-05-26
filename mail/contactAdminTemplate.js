const contactAdminTemplate = ({ userName, email, queryType, message }) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fdf3f7; border-radius: 10px;">
        <h2 style="color: #d63384;">📬 New Contact Us Message</h2>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Issue:</strong> Related to ${queryType}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: #fff; padding: 10px 15px; border-left: 4px solid #d63384; border-radius: 5px;">
          ${message}
        </p>
        <hr />
        <p style="font-size: 14px; color: #888;">This message is received from your website's contact form.</p>
      </div>
    `;
  };

  module.exports = contactAdminTemplate;