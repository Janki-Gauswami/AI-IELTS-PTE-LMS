const bcrypt = require("bcrypt");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    // For students, load their target exam from profile
    let targetExam = null;
    let targetBand = null;
    if (user.role === "student") {
      try {
        const profile = await StudentProfile.findOne({ userId: user._id }).lean();
        targetExam = profile?.targetExam || null;
        targetBand = profile?.targetBand || null;
      } catch (_) {
        // Non-critical — proceed without profile data
      }
    }

    // For teachers, load specialization from profile
    let specialization = null;
    if (user.role === "teacher") {
      try {
        const tProfile = await TeacherProfile.findOne({ userId: user._id }).lean();
        specialization = tProfile?.specialization || null;
      } catch (_) {
        // Non-critical
      }
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        targetExam,
        targetBand,
        specialization,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const logout = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

const getCurrentUser = async (req, res) => {
    try {
      const userId = req.user._id;
      const role = req.user.role;

      let targetExam = req.user.targetExam || null;
      let targetBand = req.user.targetBand || null;
      let specialization = null;

      // Re-fetch from StudentProfile to ensure latest data
      if (role === "student") {
        const profile = await StudentProfile.findOne({ userId }).lean();
        targetExam = profile?.targetExam || null;
        targetBand = profile?.targetBand || null;
      }

      // Re-fetch from TeacherProfile to ensure latest data
      if (role === "teacher") {
        const profile = await TeacherProfile.findOne({ userId }).lean();
        specialization = profile?.specialization || null;
      }

      const userObj = req.user.toObject ? req.user.toObject() : req.user;

      return res.status(200).json({
          success: true,
          user: {
            ...userObj,
            targetExam,
            targetBand,
            specialization,
          },
      });
    } catch (error) {
      return res.status(200).json({
          success: true,
          user: req.user,
      });
    }
};


const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, targetExam, targetScore, targetBand, examDate } = req.body;

    // Update User model
    const userUpdates = {};
    if (name) userUpdates.name = name.trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdates, { new: true }).select("-password");

    // If student, update StudentProfile
    let updatedProfile = null;
    if (req.user.role === "student") {
      const profileUpdates = {};
      if (phone !== undefined) profileUpdates.phone = phone.trim();
      if (targetExam) profileUpdates.targetExam = targetExam;
      if (targetScore !== undefined || targetBand !== undefined) {
        profileUpdates.targetBand = Number(targetScore ?? targetBand);
      }
      if (examDate) profileUpdates.examDate = new Date(examDate);

      updatedProfile = await StudentProfile.findOneAndUpdate(
        { userId },
        { $set: profileUpdates },
        { new: true, upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        targetExam: updatedProfile?.targetExam || targetExam || null,
        targetBand: updatedProfile?.targetBand || targetScore || targetBand || null,
        targetScore: updatedProfile?.targetBand || targetScore || targetBand || null,
        examDate: updatedProfile?.examDate || examDate || null,
      },
      data: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        targetExam: updatedProfile?.targetExam || targetExam || null,
        targetBand: updatedProfile?.targetBand || targetScore || targetBand || null,
        targetScore: updatedProfile?.targetBand || targetScore || targetBand || null,
        examDate: updatedProfile?.examDate || examDate || null,
      },
    });
  } catch (error) {
    console.error("updateMyProfile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

module.exports = {
  login,
  logout,
  getCurrentUser,
  updateMyProfile,
};