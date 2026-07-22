const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema(
  {
    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },

    // Institute Employee ID
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },

    // Highest Qualification
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },

    // Teaching Specialization
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      enum: ["IELTS", "PTE", "Both"],
    },

    // Years of Experience
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: 0,
      default: 0,
    },

    // Joining Date
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    // Address
    address: {
      type: String,
      trim: true,
      default: "",
    },

    // Short Description
    bio: {
      type: String,
      trim: true,
      default: "",
    },

    // Teacher Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// =======================================
// Indexes
// =======================================

// Fast search by employee ID
teacherProfileSchema.index({ employeeId: 1 });

// Filter by specialization
teacherProfileSchema.index({ specialization: 1 });

// Filter by status
teacherProfileSchema.index({ status: 1 });

// Combined filter
teacherProfileSchema.index({
  specialization: 1,
  status: 1,
});

module.exports = mongoose.model(
  "TeacherProfile",
  teacherProfileSchema
);