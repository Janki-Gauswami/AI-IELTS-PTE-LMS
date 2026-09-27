const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const PasswordResetOTP = require("../models/PasswordResetOTP");
const {
  sendPasswordResetOTPEmail,
  sendPasswordChangedConfirmation,
} = require("../services/emailService");

/**
 * GET /api/v1/admin/password-reset/users
 * Search students and teachers by name, email, or role
 */
exports.getUsersForPasswordReset = async (req, res) => {
  try {
    const { role, query = "" } = req.query;

    const filter = {
      role: { $in: ["student", "teacher"] },
    };

    if (role && (role === "student" || role === "teacher")) {
      filter.role = role;
    }

    if (query.trim()) {
      const searchRegex = new RegExp(query.trim(), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const users = await User.find(filter)
      .select("name email role phone profilePicture isActive createdAt")
      .sort({ name: 1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Users For Password Reset Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users for password reset.",
    });
  }
};

/**
 * POST /api/v1/admin/password-reset/send-otp
 * Admin initiates OTP request to user's registered email
 */
exports.sendPasswordResetOTP = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: "User ID or email is required.",
      });
    }

    const query = userId ? { _id: userId } : { email: email.toLowerCase().trim() };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "student" && user.role !== "teacher") {
      return res.status(400).json({
        success: false,
        message: "Password reset via OTP is only available for students and teachers.",
      });
    }

    // Invalidate existing active OTPs for this user
    await PasswordResetOTP.updateMany(
      { userId: user._id, used: false },
      { $set: { used: true } }
    );

    // Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP record
    await PasswordResetOTP.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      otp,
      expiresAt,
      used: false,
    });

    // Send real email via nodemailer
    const emailResult = await sendPasswordResetOTPEmail({
      to: user.email,
      userName: user.name,
      role: user.role,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: `A verification OTP has been sent to ${user.email}.`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        expiresAt,
        emailSent: emailResult.sent,
        // In dev environment when SMTP is unconfigured, return masked hint or otp
        deliveryNotice: emailResult.sent
          ? `Delivered to ${user.email}`
          : "SMTP unconfigured in .env - OTP logged to server terminal console",
      },
    });
  } catch (error) {
    console.error("Send Password Reset OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate and send OTP.",
    });
  }
};

/**
 * POST /api/v1/admin/password-reset/verify-and-reset
 * Admin verifies the OTP and sets the new password
 */
exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID, OTP code, and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const cleanOtp = String(otp).trim();

    // Verify OTP record
    const otpRecord = await PasswordResetOTP.findOne({
      userId,
      otp: cleanOtp,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please check the code or request a new OTP.",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Clean up older records for this user
    await PasswordResetOTP.deleteMany({
      userId,
      $or: [{ used: true }, { expiresAt: { $lt: new Date() } }],
    });

    // Send confirmation email
    sendPasswordChangedConfirmation({
      to: user.email,
      userName: user.name,
    }).catch((err) => console.error("Confirmation email notice error:", err));

    console.log(`✅ [PASSWORD RESET] Password successfully changed for ${user.role} ${user.email}`);

    return res.status(200).json({
      success: true,
      message: `Password has been successfully updated for ${user.name} (${user.email}).`,
    });
  } catch (error) {
    console.error("Verify OTP & Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset user password.",
    });
  }
};
