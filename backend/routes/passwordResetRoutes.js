const express = require("express");
const router = express.Router();

const {
  getUsersForPasswordReset,
  sendPasswordResetOTP,
  verifyOTPAndResetPassword,
} = require("../controllers/passwordResetController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All endpoints require admin access
router.use(protect, authorize("admin"));

router.get("/users", getUsersForPasswordReset);
router.post("/send-otp", sendPasswordResetOTP);
router.post("/verify-and-reset", verifyOTPAndResetPassword);

module.exports = router;
