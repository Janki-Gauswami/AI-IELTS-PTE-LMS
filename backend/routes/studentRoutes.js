const express = require("express");
const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");



const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ==========================================
// Student CRUD Routes
// ==========================================

// Create Student
router.post(
  "/",
  protect,
  authorize("admin"),
  createStudent
);

// Get All Students
router.get(
  "/",
  protect,
  authorize("admin", "teacher"),
  getAllStudents
);


// Get Student By ID
router.get(
  "/:id",
  protect,
  authorize("admin", "teacher", "student"),
  getStudentById
);

// Update Student
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateStudent
);

// Soft Delete Student
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteStudent
);

module.exports = router;
