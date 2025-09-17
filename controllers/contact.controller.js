import { Contact } from "../models/contact.model.js";
import { sendEmail } from "../uttils/email.js";

const sendMsg = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).send({
        success: false,
        message: "please provide all the fields",
      });
    }

    const Quarry = new Contact({ email, name, message });
    await Quarry.save();

    try {
      await sendEmail({
        email: process.env.EMAIL_ID,
        subject: "Meri Pehchaan New Quarry !",
        message: `
                Subject: New Inquiry from Website Visitor - MeriPehchaan

Dear Admin,

This email is to inform you of a new inquiry submitted through the Meri Pehchaan website.

Visitor Details:

Name: ${name}

Email: ${email}





Message from Visitor:
${message}

Please review this message and respond to the visitor as soon as possible. Thank you for your attention to this matter.

Best regards,
MeriPehchaan Bot
                `,
      });

      await sendEmail({
        email:email,
        subject:'Thank You for Your Inquiry - Meri Pehchaan',
        message:`


Dear ${name},

Thank you for reaching out to MeriPehchaan. We've successfully received your inquiry and appreciate you taking the time to contact us.

We understand your message is important, and our team will review it and get back to you as soon as possible. We aim to respond to all inquiries within 2-3 business days.

For your reference, here are the details you submitted:

Message:
${message}

We look forward to connecting with you soon.

Best regards,
The Meri Pehchaan Team
        `
       
      })

    } catch (err) {
      console.log("Email sending error :", err);
    }

    return res.status(201).send({
        success:true,
        message:'Your Message has been sent !'
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};



export {sendMsg}