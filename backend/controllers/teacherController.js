const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");

const bcrypt = require("bcryptjs");

// ==========================================
// Create Teacher
// ==========================================

exports.createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      employeeId,
      qualification,
      specialization,
      experience,
      joiningDate,
      address,
      bio,
    } = req.body;

    // ==============================
    // Validation
    // ==============================
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !employeeId ||
      !qualification ||
      !specialization ||
      experience === undefined ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    // ==============================
    // Check Duplicate Email
    // ==============================
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // ==============================
    // Check Duplicate Employee ID
    // ==============================
    const existingEmployee = await TeacherProfile.findOne({
      employeeId,
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists.",
      });
    }

    // ==============================
    // Hash Password
    // ==============================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==============================
    // Create User
    // ==============================
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "teacher",
    });

    // ==============================
    // Create Teacher Profile
    // ==============================
    const teacherProfile = await TeacherProfile.create({
      userId: user._id,
      employeeId,
      qualification,
      specialization,
      experience,
      joiningDate,
      address: address || "",
      bio: bio || "",
    });

    // ==============================
    // Success Response
    // ==============================
    return res.status(201).json({
      success: true,
      message: "Teacher created successfully.",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        teacherProfile,
      },
    });
  } catch (error) {
    console.error("Create Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Teachers
// ==========================================

exports.getAllTeachers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      specialization,
      qualification,
      sortBy = "joiningDate",
      order = "desc",
    } = req.query;

    // =====================================
    // Pagination
    // =====================================

    page = Number(page);
    limit = Number(limit);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Maximum records per page
    if (limit > 100) {
      limit = 100;
    }

    const skip = (page - 1) * limit;

    // =====================================
    // Filters
    // =====================================

    const teacherFilter = {};

    if (status) {
      teacherFilter.status = status;
    }

    if (specialization) {
      teacherFilter.specialization = specialization;
    }

    if (qualification) {
      teacherFilter.qualification = {
        $regex: qualification,
        $options: "i",
      };
    }

    // =====================================
    // Search
    // =====================================

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
      }).select("_id");

      const userIds = users.map((user) => user._id);

      teacherFilter.$or = [
        {
          userId: {
            $in: userIds,
          },
        },
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =====================================
    // Sorting
    // =====================================

    const sortOptions = {};

    switch (sortBy) {
      case "experience":
        sortOptions.experience = order === "asc" ? 1 : -1;
        break;

      case "joiningDate":
        sortOptions.joiningDate = order === "asc" ? 1 : -1;
        break;

      case "name":
        // Name will be sorted after populate
        break;

      default:
        sortOptions.joiningDate = -1;
    }

    // =====================================
    // Total Records
    // =====================================

    const totalTeachers = await TeacherProfile.countDocuments(
      teacherFilter
    );

    // =====================================
    // Fetch Teachers
    // =====================================

    const teachers = await TeacherProfile.find(teacherFilter)
      .populate({
        path: "userId",
        select: "name email phone isActive",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // =====================================
    // Build Response
    // =====================================

    const teacherList = [];

    for (const teacher of teachers) {
      const assignedBatches = await Batch.find({
        teachers: teacher.userId._id,
      }).select("_id");

      const batchIds = assignedBatches.map((batch) => batch._id);

      const studentCount = await Enrollment.countDocuments({
        batch: {
          $in: batchIds,
        },
        status: "Active",
      });

        teacherList.push({
        teacherId: teacher._id,

        userId: teacher.userId._id,

        name: teacher.userId.name,

        email: teacher.userId.email,

        phone: teacher.userId.phone,

        employeeId: teacher.employeeId,

        qualification: teacher.qualification,

        specialization: teacher.specialization,

        experience: teacher.experience,

        joiningDate: teacher.joiningDate
        ? teacher.joiningDate.toISOString().split("T")[0]
        : null,

        status: teacher.status,

        assignedBatchCount: assignedBatches.length,

        studentCount: Number(studentCount),
        });
    }

    // =====================================
    // Sort By Name
    // =====================================

    if (sortBy === "name") {
      teacherList.sort((a, b) => {
        if (order === "asc") {
          return a.name.localeCompare(b.name);
        }

        return b.name.localeCompare(a.name);
      });
    }

    // =====================================
    // Pagination Response
    // =====================================

    const totalPages = Math.ceil(totalTeachers / limit);

    return res.status(200).json({
      success: true,

      pagination: {
        totalRecords: totalTeachers,
        totalPages,
        currentPage: page,
        pageSize: limit,
        currentRecords: teacherList.length,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

      data: teacherList,
    });
  } catch (error) {
    console.error("Get All Teachers Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Get Teacher By ID
// ==========================================

exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================
    // Find Teacher Profile
    // =====================================
    const teacher = await TeacherProfile.findById(id).populate({
      path: "userId",
      select: "name email phone role isActive profilePicture createdAt",
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Find Assigned Batches
    // =====================================
    const assignedBatches = await Batch.find({
      teachers: teacher.userId._id,
    }).select(
      "batchName course batchType startDate endDate schedule capacity"
    );

    // =====================================
    // Count Students
    // =====================================
    const batchIds = assignedBatches.map((batch) => batch._id);

    const studentCount = await Enrollment.countDocuments({
      batch: { $in: batchIds },
      status: "Active",
    });

    // =====================================
    // Response
    // =====================================
    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: teacher.userId._id,
          name: teacher.userId.name,
          email: teacher.userId.email,
          phone: teacher.userId.phone,
          role: teacher.userId.role,
          profilePicture: teacher.userId.profilePicture,
          isActive: teacher.userId.isActive,
          createdAt: teacher.userId.createdAt,
        },

        teacherProfile: {
          _id: teacher._id,
          employeeId: teacher.employeeId,
          qualification: teacher.qualification,
          specialization: teacher.specialization,
          experience: teacher.experience,
          joiningDate: teacher.joiningDate,
          address: teacher.address,
          bio: teacher.bio,
          status: teacher.status,
          createdAt: teacher.createdAt,
          updatedAt: teacher.updatedAt,
        },

        assignedBatches,

        totalAssignedBatches: assignedBatches.length,

        totalStudents: studentCount,
      },
    });
  } catch (error) {
    console.error("Get Teacher Details Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Teacher
// ==========================================

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      qualification,
      specialization,
      experience,
      address,
      bio,
      status,
    } = req.body;

    // =====================================
    // Find Teacher Profile
    // =====================================
    const teacher = await TeacherProfile.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Find User
    // =====================================
    const user = await User.findById(teacher.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================
    // Update User Fields
    // =====================================
    if (name !== undefined) user.name = name;

    if (phone !== undefined) user.phone = phone;

    await user.save();

    // =====================================
    // Update Teacher Profile
    // =====================================
    if (qualification !== undefined)
      teacher.qualification = qualification;

    if (specialization !== undefined)
      teacher.specialization = specialization;

    if (experience !== undefined)
      teacher.experience = experience;

    if (address !== undefined)
      teacher.address = address;

    if (bio !== undefined)
      teacher.bio = bio;

    if (status !== undefined)
      teacher.status = status;

    await teacher.save();

    // =====================================
    // Fetch Updated Teacher
    // =====================================
    const updatedTeacher = await TeacherProfile.findById(
      teacher._id
    ).populate({
      path: "userId",
      select: "name email phone role isActive profilePicture",
    });

    // =====================================
    // Response
    // =====================================
    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully.",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Update Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Soft Delete Teacher
// ==========================================

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================================
    // Find Teacher Profile
    // =====================================
    const teacher = await TeacherProfile.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Find User
    // =====================================
    const user = await User.findById(teacher.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================
    // Soft Delete User
    // =====================================
    user.isActive = false;
    await user.save();

    // =====================================
    // Update Teacher Profile
    // =====================================
    teacher.status = "Inactive";
    await teacher.save();

    // =====================================
    // Remove Teacher From All Batches
    // =====================================
    await Batch.updateMany(
      { teachers: user._id },
      {
        $pull: {
          teachers: user._id,
        },
      }
    );

    // =====================================
    // Response
    // =====================================
    return res.status(200).json({
      success: true,
      message: "Teacher deactivated successfully.",
    });
  } catch (error) {
    console.error("Delete Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Assign Batch to Teacher
// ==========================================

exports.assignBatch = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { batchId } = req.body;

    // =====================================
    // Validate Input
    // =====================================

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required.",
      });
    }

    // =====================================
    // Find Teacher Profile
    // =====================================

    const teacher = await TeacherProfile.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Find User
    // =====================================

    const user = await User.findById(teacher.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================
    // Check Teacher Status
    // =====================================

    if (!user.isActive || teacher.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Teacher is inactive.",
      });
    }

    // =====================================
    // Find Batch
    // =====================================

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // =====================================
    // Check Batch Status
    // =====================================

    //if (batch.status !== "Active") {
    //  return res.status(400).json({
    //    success: false,
    //    message: "Batch is inactive.",
     // });
    //}

    // =====================================
    // Prevent Duplicate Assignment
    // =====================================

    const alreadyAssigned = batch.teachers.some(
      (teacherObjectId) =>
        teacherObjectId.toString() === user._id.toString()
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "Teacher is already assigned to this batch.",
      });
    }

    // =====================================
    // Assign Teacher
    // =====================================

    batch.teachers.push(user._id);

    await batch.save();

    // =====================================
    // Fetch Updated Batch
    // =====================================

    const updatedBatch = await Batch.findById(batch._id)
      .populate({
        path: "teachers",
        select: "name email phone",
      });

      console.log("Teacher:", teacher);
      console.log("User:", user);
      console.log("Batch:", batch);
    // =====================================
    // Response
    // =====================================

    return res.status(200).json({
      success: true,
      message: "Teacher assigned successfully.",
      data: updatedBatch,
    });

  } catch (error) {

    console.error("Assign Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Remove Teacher from Batch
// ==========================================

exports.removeBatch = async (req, res) => {
  try {
    const { teacherId, batchId } = req.params;

    // =====================================
    // Find Teacher Profile
    // =====================================

    const teacher = await TeacherProfile.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Find User
    // =====================================

    const user = await User.findById(teacher.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================
    // Find Batch
    // =====================================

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // =====================================
    // Check Teacher Assignment
    // =====================================

    const isAssigned = batch.teachers.some(
      (teacherObjectId) =>
        teacherObjectId.toString() === user._id.toString()
    );

    if (!isAssigned) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not assigned to this batch.",
      });
    }

    // =====================================
    // Remove Teacher
    // =====================================

    batch.teachers.pull(user._id);

    await batch.save();

    // =====================================
    // Fetch Updated Batch
    // =====================================

    const updatedBatch = await Batch.findById(batch._id)
      .populate({
        path: "teachers",
        select: "name email phone",
      });

    // =====================================
    // Response
    // =====================================

    return res.status(200).json({
      success: true,
      message: "Teacher removed successfully.",
      data: updatedBatch,
    });

  } catch (error) {

    console.error("Remove Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Assigned Batches for a Teacher
// ==========================================

exports.getAssignedBatches = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // =====================================
    // Find Teacher Profile
    // =====================================

    const teacher = await TeacherProfile.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // =====================================
    // Find Assigned Batches
    // =====================================

    const batches = await Batch.find({
      teachers: teacher.userId,
    }).populate({
      path: "teachers",
      select: "name email phone",
    });

    // =====================================
    // No Assigned Batches
    // =====================================

    if (batches.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No batches assigned.",
        totalBatches: 0,
        data: [],
      });
    }

    // =====================================
    // Prepare Response
    // =====================================

    const batchList = [];

    for (const batch of batches) {
      // Count Active Students

      const currentStudents = await Enrollment.countDocuments({
        batch: batch._id,
        status: "Active",
      });

      batchList.push({
        batchId: batch._id,
        batchName: batch.batchName,
        course: batch.course,
        batchType: batch.batchType,
        schedule: batch.schedule,
        capacity: batch.capacity,
        currentStudents,
        status: batch.status,
        teachers: batch.teachers,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      });
    }

    // =====================================
    // Success Response
    // =====================================

    return res.status(200).json({
      success: true,
      message: "Assigned batches fetched successfully.",
      totalBatches: batchList.length,
      data: batchList,
    });
  } catch (error) {
    console.error("Get Assigned Batches Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Teachers Assigned to a Batch
// ==========================================

exports.getTeachersByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    // =====================================
    // Find Batch
    // =====================================

    const batch = await Batch.findById(batchId).populate({
      path: "teachers",
      select: "name email phone isActive",
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // =====================================
    // No Teachers Assigned
    // =====================================

    if (batch.teachers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No teachers assigned to this batch.",
        totalTeachers: 0,
        data: [],
      });
    }

    // =====================================
    // Prepare Teacher List
    // =====================================

    const teacherList = [];

    for (const user of batch.teachers) {

      const teacherProfile = await TeacherProfile.findOne({
        userId: user._id,
      });

      if (!teacherProfile) continue;

      teacherList.push({
        teacherId: teacherProfile._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        employeeId: teacherProfile.employeeId,
        qualification: teacherProfile.qualification,
        specialization: teacherProfile.specialization,
        experience: teacherProfile.experience,
        joiningDate: teacherProfile.joiningDate,
        status: teacherProfile.status,
      });
    }

    // =====================================
    // Success Response
    // =====================================

    return res.status(200).json({
      success: true,
      message: "Teachers fetched successfully.",
      totalTeachers: teacherList.length,
      data: teacherList,
    });

  } catch (error) {

    console.error("Get Teachers By Batch Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Change Teacher
// ==========================================

exports.changeTeacher = async (req, res) => {
  try {
    const { batchId, oldTeacherId, newTeacherId } = req.body;

    // =====================================
    // Validate Input
    // =====================================

    if (!batchId || !oldTeacherId || !newTeacherId) {
      return res.status(400).json({
        success: false,
        message:
          "Batch ID, Old Teacher ID and New Teacher ID are required.",
      });
    }

    // =====================================
    // Find Batch
    // =====================================

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    if (batch.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Batch is inactive.",
      });
    }

    // =====================================
    // Find Old Teacher Profile
    // =====================================

    const oldTeacher = await TeacherProfile.findById(oldTeacherId);

    if (!oldTeacher) {
      return res.status(404).json({
        success: false,
        message: "Old teacher not found.",
      });
    }

    // =====================================
    // Find New Teacher Profile
    // =====================================

    const newTeacher = await TeacherProfile.findById(newTeacherId);

    if (!newTeacher) {
      return res.status(404).json({
        success: false,
        message: "New teacher not found.",
      });
    }

    // =====================================
    // Get User Details
    // =====================================

    const oldUser = await User.findById(oldTeacher.userId);
    const newUser = await User.findById(newTeacher.userId);

    if (!oldUser || !newUser) {
      return res.status(404).json({
        success: false,
        message: "Teacher user not found.",
      });
    }

    // =====================================
    // Check New Teacher Status
    // =====================================

    if (!newUser.isActive || newTeacher.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "New teacher is inactive.",
      });
    }

    // =====================================
    // Check Old Teacher Assignment
    // =====================================

    const oldAssigned = batch.teachers.some(
      (teacherId) => teacherId.toString() === oldUser._id.toString()
    );

    if (!oldAssigned) {
      return res.status(400).json({
        success: false,
        message: "Old teacher is not assigned to this batch.",
      });
    }

    // =====================================
    // Prevent Duplicate Assignment
    // =====================================

    const newAssigned = batch.teachers.some(
      (teacherId) => teacherId.toString() === newUser._id.toString()
    );

    if (newAssigned) {
      return res.status(400).json({
        success: false,
        message: "New teacher is already assigned to this batch.",
      });
    }

    // =====================================
    // Replace Teacher
    // =====================================

    batch.teachers.pull(oldUser._id);

    batch.teachers.push(newUser._id);

    await batch.save();

    // =====================================
    // Return Updated Batch
    // =====================================

    const updatedBatch = await Batch.findById(batchId).populate({
      path: "teachers",
      select: "name email phone",
    });

    return res.status(200).json({
      success: true,
      message: "Teacher changed successfully.",
      data: updatedBatch,
    });

  } catch (error) {

    console.error("Change Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};