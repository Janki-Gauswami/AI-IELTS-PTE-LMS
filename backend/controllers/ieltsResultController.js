const IELTSResult = require("../models/IELTSResult");

// ==========================================
// Create IELTS Result
// ==========================================

exports.createResult = async (req, res) => {
  try {
    const {
      student,
      batch,
      listening,
      reading,
      writing,
      speaking,
      overallBand,
      resultType,
    } = req.body;

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student is required.",
      });
    }

    const result = await IELTSResult.create({
      student,
      batch: batch || null,

      listening,
      reading,
      writing,
      speaking,

      overallBand,
      resultType,

      evaluatedBy: req.user._id,

      status: "Evaluated",
      evaluatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "IELTS result created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Create IELTS Result Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Student Results
// ==========================================

exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    const results = await IELTSResult.find({
      student: studentId,
    })
      .populate("student", "name email")
      .populate("batch", "batchName course")
      .populate("evaluatedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get IELTS Results Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Results
// ==========================================

exports.getMyResults = async (req, res) => {
  try {
    const results = await IELTSResult.find({
      student: req.user._id,
    })
      .populate("batch", "batchName course")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get My IELTS Results Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Result By ID
// ==========================================

exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await IELTSResult.findById(id)
      .populate("student", "name email")
      .populate("batch", "batchName course")
      .populate("evaluatedBy", "name email")
      .populate(
        "writing.teacher",
        "name email"
      )
      .populate(
        "speaking.teacher",
        "name email"
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "IELTS result not found.",
      });
    }

    if (
      req.user.role === "student" &&
      result.student._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own result.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get IELTS Result Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Result
// ==========================================

exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await IELTSResult.findById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "IELTS result not found.",
      });
    }

    const {
      listening,
      reading,
      writing,
      speaking,
      overallBand,
      status,
    } = req.body;

    result.listening =
      listening ?? result.listening;

    result.reading =
      reading ?? result.reading;

    result.writing =
      writing ?? result.writing;

    result.speaking =
      speaking ?? result.speaking;

    result.overallBand =
      overallBand ?? result.overallBand;

    result.status =
      status ?? result.status;

    if (status === "Evaluated") {
      result.evaluatedBy = req.user._id;
      result.evaluatedAt = new Date();
    }

    await result.save();

    return res.status(200).json({
      success: true,
      message: "IELTS result updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Update IELTS Result Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Create / Update Result From IELTS Attempt
// ==========================================

const IELTSTestAttempt =
  require("../models/IELTSTestAttempt");

exports.createResultFromAttempt = async (
  req,
  res
) => {
  try {
    const { attemptId } = req.params;

    // ==========================================
    // Find IELTS Attempt
    // ==========================================

    const attempt =
      await IELTSTestAttempt.findById(
        attemptId
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "IELTS test attempt not found.",
      });
    }

    // ==========================================
    // Check Attempt Status
    // ==========================================

    if (
      attempt.status !== "Submitted" &&
      attempt.status !== "Evaluated"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "IELTS test attempt has not been completed.",
      });
    }

    // ==========================================
    // Check Student Access
    // ==========================================

    if (
      req.user.role === "student" &&
      attempt.student.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access your own IELTS result.",
      });
    }

    // ==========================================
    // Check All Four Section Bands
    // ==========================================

    if (
      attempt.listeningBand === null ||
      attempt.readingBand === null ||
      attempt.writingBand === null ||
      attempt.speakingBand === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All four IELTS section bands are required before creating the final result.",
      });
    }

    // ==========================================
    // Calculate Overall Band
    // ==========================================

    const total =
      Number(attempt.listeningBand) +
      Number(attempt.readingBand) +
      Number(attempt.writingBand) +
      Number(attempt.speakingBand);

    const average =
      total / 4;

    const decimal =
      average -
      Math.floor(average);

    let overallBand;

    if (decimal < 0.25) {
      overallBand =
        Math.floor(average);
    } else if (decimal < 0.75) {
      overallBand =
        Math.floor(average) + 0.5;
    } else {
      overallBand =
        Math.ceil(average);
    }

    // ==========================================
    // Create IELTS Result
    // ==========================================

    const result =
      await IELTSResult.create({
        student:
          attempt.student,

        listening:
          attempt.listeningBand,

        reading:
          attempt.readingBand,

        writing:
          attempt.writingBand,

        speaking:
          attempt.speakingBand,

        overallBand,

        resultType:
          "Practice Test",

        evaluatedBy:
          req.user._id,

        status:
          "Evaluated",

        evaluatedAt:
          new Date(),
      });

    // ==========================================
    // Update Attempt
    // ==========================================

    attempt.overallBand =
      overallBand;

    attempt.status =
      "Evaluated";

    await attempt.save();

    // ==========================================
    // Response
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "IELTS result created successfully.",

      data: result,
    });

  } catch (error) {
    console.error(
      "Create IELTS Result From Attempt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create IELTS result from attempt.",
    });
  }
};