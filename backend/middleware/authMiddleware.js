const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// Protect Middleware
// ==========================================

const protect = async (req, res, next) => {
  try {
    let token;

    // ==========================================
    // Check Authorization Header
    // ==========================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ==========================================
    // Token Missing
    // ==========================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // ==========================================
    // Verify Token
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // Debug Logs
    // ==========================================

    console.log("\n========== AUTHENTICATED USER ==========");
    console.log({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    console.log("========================================\n");

    // ==========================================
    // Check Account Status
    // ==========================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // ==========================================
    // Attach User
    // ==========================================

    req.user = user;

    next();

  } catch (error) {

    console.error("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });

  }
};

// ==========================================
// Role Authorization Middleware
// ==========================================

const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ==========================================
    // Debug Logs
    // ==========================================

    console.log("========== AUTHORIZE ==========");
    console.log("Allowed Roles :", roles);
    console.log("Current User  :", req.user.name);
    console.log("Current Email :", req.user.email);
    console.log("Current Role  :", req.user.role);
    console.log("===============================\n");

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};