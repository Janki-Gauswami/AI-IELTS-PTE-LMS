const IELTSLesson = require("../models/IELTSLesson");

// ==========================================
// Create IELTS Lesson
// ==========================================

exports.createLesson = async (req, res) => {
  try {
    const {
      title,
      description,
      section,
      lessonType,
      difficulty,
      content,
      audioUrl,
      videoUrl,
      duration,
      status,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!title || !section) {
      return res.status(400).json({
        success: false,
        message: "Title and section are required.",
      });
    }

    // ==========================================
    // Create Lesson
    // ==========================================

    const lesson = await IELTSLesson.create({
      title,
      description,
      section,
      lessonType,
      difficulty,
      content,
      audioUrl,
      videoUrl,
      duration,
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "IELTS lesson created successfully.",
      data: lesson,
    });
  } catch (error) {
    console.error("Create IELTS Lesson Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All IELTS Lessons
// ==========================================

exports.getAllLessons = async (req, res) => {
  try {
    const {
      section,
      difficulty,
      lessonType,
      status,
    } = req.query;

    const filter = {};

    if (section) filter.section = section;
    if (difficulty) filter.difficulty = difficulty;
    if (lessonType) filter.lessonType = lessonType;
    if (status) filter.status = status;

    const lessons = await IELTSLesson.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    console.error("Get IELTS Lessons Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Lesson By ID
// ==========================================

exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await IELTSLesson.findById(id)
      .populate("createdBy", "name email");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "IELTS lesson not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("Get IELTS Lesson Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Lesson
// ==========================================

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await IELTSLesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "IELTS lesson not found.",
      });
    }

    const {
      title,
      description,
      section,
      lessonType,
      difficulty,
      content,
      audioUrl,
      videoUrl,
      duration,
      status,
    } = req.body;

    lesson.title = title ?? lesson.title;
    lesson.description = description ?? lesson.description;
    lesson.section = section ?? lesson.section;
    lesson.lessonType = lessonType ?? lesson.lessonType;
    lesson.difficulty = difficulty ?? lesson.difficulty;
    lesson.content = content ?? lesson.content;
    lesson.audioUrl = audioUrl ?? lesson.audioUrl;
    lesson.videoUrl = videoUrl ?? lesson.videoUrl;
    lesson.duration = duration ?? lesson.duration;
    lesson.status = status ?? lesson.status;

    await lesson.save();

    return res.status(200).json({
      success: true,
      message: "IELTS lesson updated successfully.",
      data: lesson,
    });
  } catch (error) {
    console.error("Update IELTS Lesson Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Lesson
// ==========================================

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await IELTSLesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "IELTS lesson not found.",
      });
    }

    await IELTSLesson.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "IELTS lesson deleted successfully.",
    });
  } catch (error) {
    console.error("Delete IELTS Lesson Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};