const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      unique: true,
    },

    course: {
      type: String,
      required: [true, "Course is required"],
      enum: ["IELTS", "PTE"],
    },

    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    schedule: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
      ],

      startTime: {
        type: String,
        required: [true, "Start time is required"],
      },

      endTime: {
        type: String,
        required: [true, "End time is required"],
      },
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },

    currentStrength: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// =======================================
// MongoDB Indexes
// =======================================

// Search by batch name
batchSchema.index({ batchName: 1 });

// Filter by course
batchSchema.index({ course: 1 });

// Find batches assigned to a teacher
batchSchema.index({ teachers: 1 });

// Filter by status
batchSchema.index({ status: 1 });

// Common filter: Course + Status
batchSchema.index({
  course: 1,
  status: 1,
});

module.exports = mongoose.model("Batch", batchSchema);