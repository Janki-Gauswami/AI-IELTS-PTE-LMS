const { sendContactFormEmail } = require("../services/emailService");

/**
 * POST /api/v1/contact
 * Handle landing page contact form submissions
 * Sends form data to gjanki410@gmail.com
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Your name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Your email address is required.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty.",
      });
    }

    // Send email to gjanki410@gmail.com
    const result = await sendContactFormEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || "Inquiry from LMS Landing Page").trim(),
      message: message.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Thank you for contacting us! Your message has been sent to our team at gjanki410@gmail.com.",
      data: {
        delivered: result.sent,
        targetEmail: "gjanki410@gmail.com",
      },
    });
  } catch (error) {
    console.error("Submit Contact Form Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
};
