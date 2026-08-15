const mongoose = require("mongoose");

const learningMaterialSchema = new mongoose.Schema(
  {
    // ==========================================
    // Material Information
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // ==========================================
    // Material Type
    // ==========================================

    materialType: {
      type: String,
      required: true,
      enum: [
        "PDF",
        "Video",
        "Audio",
        "Document",
        "Link",
      ],
    },

    // ==========================================
    // Resource URL
    // ==========================================

    resourceUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Thumbnail
    // ==========================================

    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // Course
    // ==========================================

    course: {
      type: String,
      required: true,
      enum: [
        "IELTS",
        "PTE",
      ],
    },

    // ==========================================
    // Module
    // ==========================================

    module: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Batch
    // ==========================================

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // ==========================================
    // Uploaded By
    // ==========================================

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Status
    // ==========================================

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LearningMaterial",
  learningMaterialSchema
);