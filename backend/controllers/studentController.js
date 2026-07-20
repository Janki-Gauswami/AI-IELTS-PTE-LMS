

const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");
const Batch = require("../models/Batch");

const bcrypt = require("bcryptjs");

// ==========================================
// Create Student
// ==========================================

exports.createStudent = async (req, res) => {
  try {
    console.log("========== CREATE STUDENT START ==========");

    const {
      name,
      email,
      password,
      phone,
      profilePicture,

      enrollmentNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,

      targetExam,
      targetBand,
      targetCountry,
      goal,

      batchId,
    } = req.body;

    console.log("Request Body:", req.body);

    // ==========================================
    // Check Required Fields
    // ==========================================

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !enrollmentNumber ||
      !dateOfBirth ||
      !gender ||
      !emergencyContact ||
      !targetExam ||
      targetBand === undefined ||
      !targetCountry ||
      !batchId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    console.log("✓ Required fields validated");

    // ==========================================
    // Check Existing User
    // ==========================================

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const existingEnrollment = await StudentProfile.findOne({
      enrollmentNumber,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number already exists.",
      });
    }

    console.log("✓ User & enrollment number validated");

    // ==========================================
    // Find Batch
    // ==========================================

    const batch = await Batch.findById(batchId);

    console.log("Batch Found:", batch);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }
    if (batch.currentStrength >= batch.capacity) {
      return res.status(400).json({
        success: false,
        message: "Batch is already full.",
      });
    }

    if (batch.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Students can only be assigned to an active batch.",
      });
    }

    console.log("✓ Batch validated");

    // ==========================================
    // Check Capacity
    // ==========================================

    if (batch.currentStrength >= batch.capacity) {
      return res.status(400).json({
        success: false,
        message: "Batch is already full.",
      });
    }

    // ==========================================
    // Target Validation
    // ==========================================

    if (
      targetExam === "IELTS" &&
      (targetBand < 1 || targetBand > 9)
    ) {
      return res.status(400).json({
        success: false,
        message: "IELTS target band must be between 1 and 9.",
      });
    }

    if (
      targetExam === "PTE" &&
      (targetBand < 10 || targetBand > 90)
    ) {
      return res.status(400).json({
        success: false,
        message: "PTE target score must be between 10 and 90.",
      });
    }

    console.log("✓ Target validation completed");

    // ==========================================
    // Hash Password
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("✓ Password hashed");

    // ==========================================
    // Create User
    // ==========================================

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "student",
      profilePicture,
    });

    console.log("✓ User Created");
    console.log(user);

    // ==========================================
    // Create Student Profile
    // ==========================================

    const studentProfile = await StudentProfile.create({
      userId: user._id,

      enrollmentNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,

      targetExam,
      targetBand,
      targetCountry,
      goal,
    });

    console.log("✓ Student Profile Created");
    console.log(studentProfile);

    // ==========================================
    // Create Enrollment
    // ==========================================

    console.log("Creating Enrollment...");
    console.log("Student ID:", user._id);
    console.log("Batch ID:", batchId);

    const enrollment = await Enrollment.create({
      student: user._id,
      batch: batchId,
    });

    console.log("✓ Enrollment Created Successfully");
    console.log(enrollment);
// ==========================================
// Update Batch Strength
// ==========================================

// Update only currentStrength without validating the
// entire batch document.

await Batch.updateOne(
  { _id: batchId },
  {
    $inc: {
      currentStrength: 1,
    },
  }
);

console.log("✓ Batch Strength Updated");

    // ==========================================
    // Success Response
    // ==========================================

    console.log("========== CREATE STUDENT SUCCESS ==========");

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: {
        user,
        studentProfile,
        enrollment,
      },
    });

  } catch (error) {

    console.error("========== CREATE STUDENT ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack, // Remove this in production
    });

  }
};

// ==========================================
// Get All Students
// ==========================================

exports.getAllStudents = async (req, res) => {
  try {
    const {
      search,
      targetExam,
      targetCountry,
      status,
      batchId,
      sortBy = "joinedDate",
      order = "desc",
    } = req.query;

    const profileFilter = {};

    if (targetExam) profileFilter.targetExam = targetExam;
    if (targetCountry) profileFilter.targetCountry = targetCountry;
    if (status) profileFilter.status = status;

    let userIds = [];

    if (search) {
      const users = await User.find({
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      });

      userIds = users.map((user) => user._id);

      profileFilter.$or = [
        { userId: { $in: userIds } },
        {
          enrollmentNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const sortOptions = {};

    switch (sortBy) {
      case "targetBand":
        sortOptions.targetBand = order === "asc" ? 1 : -1;
        break;

      case "joinedDate":
      default:
        sortOptions.joinedDate = order === "asc" ? 1 : -1;
        break;
    }

    const students = await StudentProfile.find(profileFilter)
      .sort(sortOptions)
      .populate({
        path: "userId",
        select: "-password",
      });

    const finalStudents = [];

    for (const student of students) {
      const enrollment = await Enrollment.findOne({
        student: student.userId._id,
      }).populate("batch");

      if (batchId) {
        if (
          !enrollment ||
          enrollment.batch._id.toString() !== batchId
        ) {
          continue;
        }
      }

      finalStudents.push({
        user: student.userId,
        profile: student,
        enrollment,
      });
    }

    res.status(200).json({
      success: true,
      count: finalStudents.length,
      data: finalStudents,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Student By ID
// ==========================================

exports.getStudentById = async (req, res) => {
  try {

    const { id } = req.params;

    // ==========================================
    // Find Student Profile
    // ==========================================

    const studentProfile = await StudentProfile.findOne({
      userId: id,
    }).populate({
      path: "userId",
      select: "-password",
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // ==========================================
    // Find Enrollment
    // ==========================================

    const enrollment = await Enrollment.findOne({
      student: id,
    }).populate({
      path: "batch",
      populate: {
        path: "teachers",
        select: "name email",
      },
    });

    // ==========================================
    // Ownership Validation
    // ==========================================

    // Student can access only own profile
    if (req.user.role === "student") {

      if (req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own profile.",
        });
      }

    }

    // Teacher can only access students
    // from assigned batches
    if (req.user.role === "teacher") {

      if (!enrollment || !enrollment.batch) {
        return res.status(403).json({
          success: false,
          message: "Student is not assigned to any batch.",
        });
      }

      const teacherAssigned = enrollment.batch.teachers.some(
        (teacherId) =>
          teacherId.toString() === req.user._id.toString()
      );

      if (!teacherAssigned) {
        return res.status(403).json({
          success: false,
          message:
            "You can only access students from your assigned batches.",
        });
      }

    }

    // ==========================================
    // Success Response
    // ==========================================

    res.status(200).json({
      success: true,
      data: {
        user: studentProfile.userId,
        profile: studentProfile,
        enrollment,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Update Student
// ==========================================

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      profilePicture,

      dateOfBirth,
      gender,
      address,
      emergencyContact,

      targetExam,
      targetBand,
      targetCountry,
      goal,

      batchId,
      status,
    } = req.body;

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // ==========================================
    // Update User
    // ==========================================

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.profilePicture = profilePicture ?? user.profilePicture;

    await user.save();

    // ==========================================
    // Find Student Profile
    // ==========================================

    const studentProfile = await StudentProfile.findOne({
      userId: id,
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // ==========================================
    // Update Student Profile
    // ==========================================

    studentProfile.dateOfBirth =
      dateOfBirth ?? studentProfile.dateOfBirth;

    studentProfile.gender =
      gender ?? studentProfile.gender;

    studentProfile.address =
      address ?? studentProfile.address;

    studentProfile.emergencyContact =
      emergencyContact ?? studentProfile.emergencyContact;

    studentProfile.targetExam =
      targetExam ?? studentProfile.targetExam;

    studentProfile.targetBand =
      targetBand ?? studentProfile.targetBand;

    studentProfile.targetCountry =
      targetCountry ?? studentProfile.targetCountry;

    studentProfile.goal =
      goal ?? studentProfile.goal;

    studentProfile.status =
      status ?? studentProfile.status;

    await studentProfile.save();

    // ==========================================
    // Update Batch (Optional)
    // ==========================================

    if (batchId) {
      const enrollment = await Enrollment.findOne({
        student: id,
        });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found.",
        });
      }

      // Only transfer if batch changes
      if (enrollment.batch.toString() !== batchId) {

        const oldBatch = await Batch.findById(enrollment.batch);
        const newBatch = await Batch.findById(batchId);

        if (!newBatch) {
          return res.status(404).json({
            success: false,
            message: "New batch not found.",
          });
        }

        if (newBatch.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Students can only be transferred to an active batch.",
            });
        }

        if (newBatch.currentStrength >= newBatch.capacity) {
          return res.status(400).json({
            success: false,
            message: "New batch is already full.",
          });
        }

        // Update strengths
        await Batch.updateOne(
          { _id: oldBatch._id },
          {
            $inc: {
              currentStrength: -1,
            },
          }
        );

        await Batch.updateOne(
          { _id: newBatch._id },
          {
            $inc: {
              currentStrength: 1,
            },
          }
        );

        // Update enrollment
        enrollment.batch = batchId;

        await enrollment.save();
      }
    }

    // ==========================================
    // Return Updated Student
    // ==========================================

    const updatedStudent = await StudentProfile.findOne({
      userId: id,
    }).populate({
      path: "userId",
      select: "-password",
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      data: updatedStudent,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ==========================================
// Soft Delete Student
// ==========================================

exports.deleteStudent = async (req, res) => {
  try {

    const { id } = req.params;

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // ==========================================
    // Find Student Profile
    // ==========================================

    const studentProfile = await StudentProfile.findOne({
      userId: id,
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // ==========================================
    // Find Enrollment
    // ==========================================

    const enrollment = await Enrollment.findOne({
        student: id,
    });
    // ==========================================
    // Update Batch Strength
    // ==========================================

    if (enrollment) {

      const batch = await Batch.findById(enrollment.batch);

      if (batch && batch.currentStrength > 0) {

        await Batch.updateOne(
          { _id: batch._id },
          {
            $inc: {
              currentStrength: -1,
            },
          }
        );
      }

      // Optional:
      // Mark enrollment inactive
      enrollment.status = "Cancelled";

      await enrollment.save();
    }

    // ==========================================
    // Soft Delete User
    // ==========================================

    user.isActive = false;

    await user.save();

    // ==========================================
    // Soft Delete Student Profile
    // ==========================================

    studentProfile.status = "Inactive";

    await studentProfile.save();

    // ==========================================
    // Success Response
    // ==========================================

    res.status(200).json({
      success: true,
      message: "Student deactivated successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


