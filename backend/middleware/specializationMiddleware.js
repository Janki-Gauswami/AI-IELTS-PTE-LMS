const TeacherProfile = require("../models/TeacherProfile");

/**
 * Middleware to verify a teacher's specialization from the database.
 * @param {"IELTS" | "PTE"} requiredCourse
 */
const checkTeacherSpecialization = (requiredCourse) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // Admins have unrestricted access to both IELTS and PTE
      if (req.user.role === "admin") {
        return next();
      }

      // Only teachers are subject to specialization checks
      if (req.user.role !== "teacher") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only teachers and admins can perform this action.",
        });
      }

      // Query database for the latest teacher profile
      const teacherProfile = await TeacherProfile.findOne({
        userId: req.user._id,
      });

      if (!teacherProfile) {
        return res.status(403).json({
          success: false,
          message: "Teacher profile not found in database.",
        });
      }

      if (teacherProfile.status !== "Active") {
        return res.status(403).json({
          success: false,
          message: "Your teacher account is currently inactive.",
        });
      }

      const specialization = teacherProfile.specialization; // "IELTS", "PTE", or "Both"

      const isAllowed =
        specialization === "Both" || specialization === requiredCourse;

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your teacher profile is assigned to ${specialization}, which does not allow managing or evaluating ${requiredCourse} tests.`,
          requiredCourse,
          currentSpecialization: specialization,
        });
      }

      // Attach profile to request for use in controllers
      req.teacherProfile = teacherProfile;
      next();
    } catch (error) {
      console.error("Specialization Middleware Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error verifying teacher specialization.",
      });
    }
  };
};

module.exports = {
  checkTeacherSpecialization,
};
