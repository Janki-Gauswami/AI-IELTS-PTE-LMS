const bcrypt = require("bcrypt");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
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

      // Re-fetch from StudentProfile to ensure latest data
      if (role === "student") {
        const profile = await StudentProfile.findOne({ userId }).lean();
        targetExam = profile?.targetExam || null;
        targetBand = profile?.targetBand || null;
      }

      return res.status(200).json({
          success: true,
          user: {
            ...req.user,
            targetExam,
            targetBand,
          },
      });
    } catch (error) {
      return res.status(200).json({
          success: true,
          user: req.user,
      });
    }
};


module.exports = {
  login,
  logout,
  getCurrentUser,
};