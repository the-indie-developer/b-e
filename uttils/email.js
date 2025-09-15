import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
  try {
   
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_KEY,
      },
    });

   
    const mailOptions = {
      from: `Meri Pehchaan <${process.env.EMAIL_ID}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, 
    };

   
    await transporter.sendMail(mailOptions);
   
  } catch (error) {
  
    throw new Error('Email could not be sent.');
  }
};

export { sendEmail}