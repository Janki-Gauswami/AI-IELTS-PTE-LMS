const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");

// ==========================================
// Dashboard Summary
// ==========================================

exports.getDashboardSummary = async (req, res) => {
  try {

    // =====================================
    // Logged-in Teacher
    // =====================================

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Teacher Profile
    // =====================================

    const teacherProfile = await TeacherProfile.findOne({
      userId: user._id,
    });

    if (!teacherProfile) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found.",
      });
    }

    // =====================================
    // Assigned Batches
    // =====================================

    const batches = await Batch.find({
      teachers: user._id,
    });

    const assignedBatchCount = batches.length;

    // =====================================
    // Count Students
    // =====================================

    let totalStudents = 0;

    for (const batch of batches) {

      const studentCount =
        await Enrollment.countDocuments({
          batch: batch._id,
          status: "Active",
        });

      totalStudents += studentCount;
    }

    // =====================================
    // Today's Classes
    // =====================================

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    let todayClasses = 0;

    for (const batch of batches) {

      if (
        batch.schedule &&
        batch.schedule.days &&
        batch.schedule.days.includes(today)
      ) {
        todayClasses++;
      }
    }

    // =====================================
    // Response
    // =====================================

    return res.status(200).json({
      success: true,
      data: {
        teacherName: user.name,
        assignedBatches: assignedBatchCount,
        students: totalStudents,
        todayClasses,
        upcomingTests: 0,
      },
    });

  } catch (error) {

    console.error("Dashboard Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// My Batches
// ==========================================

exports.getMyBatches = async (req, res) => {
  try {

    // =====================================
    // Find Logged-in Teacher
    // =====================================

    const teacher = await TeacherProfile.findOne({
      userId: req.user._id,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found.",
      });
    }

    // =====================================
    // Find Assigned Batches
    // =====================================

    const batches = await Batch.find({
      teachers: req.user._id,
    });

    // =====================================
    // Prepare Response
    // =====================================

    const batchList = [];

    for (const batch of batches) {

      const studentCount = await Enrollment.countDocuments({
        batch: batch._id,
        status: "Active",
      });

      batchList.push({
        batchId: batch._id,
        batchName: batch.batchName,
        course: batch.course,
        batchType: batch.batchType,
        schedule: batch.schedule,
        startDate: batch.startDate,
        endDate: batch.endDate,
        capacity: batch.capacity,
        currentStudents: studentCount,
        status: batch.status,
      });

    }

    // =====================================
    // Response
    // =====================================

    return res.status(200).json({
      success: true,
      totalBatches: batchList.length,
      data: batchList,
    });

  } catch (error) {

    console.error("My Batches Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Today's Classes
// ==========================================

exports.getTodayClasses = async (req, res) => {
  try {

    // =====================================
    // Find Logged-in Teacher
    // =====================================

    const teacher = await TeacherProfile.findOne({
      userId: req.user._id,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found.",
      });
    }

    // =====================================
    // Get Today's Day
    // =====================================

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    // =====================================
    // Find Assigned Batches
    // =====================================

    const batches = await Batch.find({
      teachers: req.user._id,
    });

    // =====================================
    // Filter Today's Classes
    // =====================================

    const todayClasses = [];

    for (const batch of batches) {

      if (
        batch.schedule &&
        batch.schedule.days &&
        batch.schedule.days.includes(today)
      ) {

        todayClasses.push({
          batchId: batch._id,
          batchName: batch.batchName,
          course: batch.course,
          batchType: batch.batchType,
          schedule: batch.schedule,
          startDate: batch.startDate,
          endDate: batch.endDate,
          capacity: batch.capacity,
          status: batch.status,
        });

      }

    }

    // =====================================
    // Sort by Start Time
    // =====================================

    todayClasses.sort((a, b) =>
      a.schedule.startTime.localeCompare(b.schedule.startTime)
    );

    // =====================================
    // Response
    // =====================================

    return res.status(200).json({
      success: true,
      today,
      totalClasses: todayClasses.length,
      data: todayClasses,
    });

  } catch (error) {

    console.error("Today's Classes Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ==========================================
// Get Teacher Profile
// ==========================================

exports.getTeacherProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find User
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Find Teacher Profile
    const teacher = await TeacherProfile.findOne({ userId: userId });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        employeeId: teacher.employeeId,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        experience: teacher.experience,
        joiningDate: teacher.joiningDate,
        address: teacher.address,
        bio: teacher.bio,
        profilePicture: user.profilePicture,
        status: teacher.status,
      },
    });
  } catch (error) {
    console.error("Get Teacher Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher profile.",
    });
  }
};

// ==========================================
// Update Teacher Profile
// ==========================================

exports.updateTeacherProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      phone,
      address,
      qualification,
      specialization,
      experience,
      bio,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const teacher = await TeacherProfile.findOne({
      userId,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found.",
      });
    }

    // Update User fields
    user.phone = phone || user.phone;

    // Update Teacher Profile fields
    teacher.address = address || teacher.address;
    teacher.qualification = qualification || teacher.qualification;
    teacher.specialization = specialization || teacher.specialization;
    teacher.experience = experience ?? teacher.experience;
    teacher.bio = bio || teacher.bio;

    await user.save();
    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });

  } catch (error) {
    console.error("Update Teacher Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// My Students
// ==========================================

exports.getMyStudents = async (req, res) => {
  try {
    const { batch } = req.query;

    if (!batch) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required.",
      });
    }

    // Verify batch belongs to logged in teacher
    const assignedBatch = await Batch.findOne({
      _id: batch,
      teachers: req.user._id,
    });

    if (!assignedBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const enrollments = await Enrollment.find({
      batch,
      status: "Active",
    })
      .populate("student", "name email phone profilePicture");

    const students = enrollments.map((item) => ({
      studentId: item.student?._id,
      name: item.student?.name,
      email: item.student?.email,
      phone: item.student?.phone,
      profilePicture: item.student?.profilePicture,
    }));

    return res.status(200).json({
      success: true,
      students,
    });

  } catch (error) {
    console.error("My Students Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};