const contactResponseTemplate = ({ userName, queryType}) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fdf3f7; border-radius: 10px;">
        <p> Dear ${userName}, Your Contact form related to ${queryType} is submitted successfully. You will get an update soon....</p>
      </div>
    `;
  };

  module.exports = contactResponseTemplate;