require('dotenv').config();

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendSignupMail = async (name, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
      }
    });

    const emailTemplate = fs.readFileSync(path.join(__dirname, "emailTemplate.html"), "utf-8");
    const customizedTemplate = emailTemplate.replace("{{name}}", name);

    const mailOptions = {
      from: `"RP" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: "Welcome to Your Store!",
      html: customizedTemplate
    };

    await transporter.sendMail(mailOptions);
    console.log("Signup email sent to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendSignupMail
};
