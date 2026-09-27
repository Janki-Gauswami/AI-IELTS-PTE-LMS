const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

/*
========================================================
 EXISTING ROUTES
========================================================
*/

const authRoutes = require("./routes/authRoutes");
const batchRoutes = require("./routes/batchRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

const teacherDashboardRoutes = require(
  "./routes/teacherDashboardRoutes"
);

const attendanceRoutes = require(
  "./routes/attendanceRoutes"
);

const learningMaterialRoutes = require(
  "./routes/learningMaterialRoutes"
);


/*
========================================================
 IELTS ROUTES
========================================================
*/

const ieltsLessonRoutes = require(
  "./routes/ieltsLessonRoutes"
);

const ieltsQuestionRoutes = require(
  "./routes/ieltsQuestionRoutes"
);

const ieltsTestRoutes = require(
  "./routes/ieltsTestRoutes"
);

const ieltsAttemptRoutes = require(
  "./routes/ieltsAttemptRoutes"
);

const ieltsResultRoutes = require(
  "./routes/ieltsResultRoutes"
);

const ieltsPracticeTestRoutes = require(
  "./routes/ieltsPracticeTestRoutes"
);

const ieltsTestAttemptRoutes = require(
  "./routes/ieltsTestAttemptRoutes"
);

const ieltsProgressRoutes = require(
  "./routes/ieltsProgressRoutes"
);


/*
========================================================
 PTE ROUTES
========================================================
*/

const pteLessonRoutes = require(
  "./routes/pteLessonRoutes"
);

const pteQuestionRoutes = require(
  "./routes/pteQuestionRoutes"
);

const ptePracticeTestRoutes = require(
  "./routes/ptePracticeTestRoutes"
);

const pteTestAttemptRoutes = require(
  "./routes/pteTestAttemptRoutes"
);


/*
========================================================
 SYSTEM ROUTES
========================================================
*/

const mockTestRoutes = require(
  "./routes/mockTestRoutes"
);

const analyticsRoutes = require(
  "./routes/analyticsRoutes"
);

const aiRoutes = require(
  "./routes/aiRoutes"
);

const notificationRoutes = require(
  "./routes/notificationRoutes"
);

const reportRoutes = require(
  "./routes/reportRoutes"
);

const attendanceReportRoutes = require(
  "./routes/attendanceReportRoutes"
);

const uploadRoutes = require(
  "./routes/uploadRoutes"
);

const passwordResetRoutes = require(
  "./routes/passwordResetRoutes"
);

const contactRoutes = require(
  "./routes/contactRoutes"
);


/*
========================================================
 EXPRESS APP
========================================================
*/

const app = express();
const connectDB = require("./config/database");

// Auto-connect to Database for Serverless (Vercel) & Traditional environments
app.use(async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error("Database connection error in request:", err);
    return res.status(500).json({
      success: false,
      message: "Database connection failed. Please check server configuration.",
    });
  }
});


/*
========================================================
 MIDDLEWARES
========================================================
*/
 CORS
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


/*
 JSON BODY
*/

app.use(
  express.json({
    limit: "10mb",
  })
);


/*
 URL ENCODED BODY
*/

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);


/*
 COOKIE PARSER
*/

app.use(cookieParser());


/*
 STATIC UPLOADS
*/

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


/*
========================================================
 AUTHENTICATION
========================================================

 Base:

 /api/v1/auth

========================================================
*/

app.use(
  "/api/v1/auth",
  authRoutes
);


/*
========================================================
 BATCH MANAGEMENT
========================================================

 /api/v1/batches

========================================================
*/

app.use(
  "/api/v1/batches",
  batchRoutes
);


/*
========================================================
 ENROLLMENT MANAGEMENT
========================================================

 /api/v1/enrollments

========================================================
*/

app.use(
  "/api/v1/enrollments",
  enrollmentRoutes
);


/*
========================================================
 ADMIN DASHBOARD
========================================================

 /api/v1/dashboard

========================================================
*/

app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);


/*
========================================================
 STUDENT MANAGEMENT
========================================================

 /api/v1/students

========================================================
*/

app.use(
  "/api/v1/students",
  studentRoutes
);


/*
========================================================
 TEACHER MANAGEMENT
========================================================

 /api/v1/teachers

========================================================
*/

app.use(
  "/api/v1/teachers",
  teacherRoutes
);


/*
========================================================
 TEACHER DASHBOARD
========================================================

 /api/v1/teacher

========================================================
*/

app.use(
  "/api/v1/teacher",
  teacherDashboardRoutes
);


/*
========================================================
 ATTENDANCE
========================================================

 /api/v1/attendance

========================================================
*/

app.use(
  "/api/v1/attendance",
  attendanceRoutes
);


/*
========================================================
 LEARNING MATERIALS
========================================================

 /api/v1/learning-materials

========================================================
*/

app.use(
  "/api/v1/learning-materials",
  learningMaterialRoutes
);


/*
========================================================
 IELTS ROUTES
========================================================
*/


/*
--------------------------------------------------------
 IELTS LESSONS
--------------------------------------------------------

 GET     /api/v1/ielts/lessons
 GET     /api/v1/ielts/lessons/:id
 POST    /api/v1/ielts/lessons
 PUT     /api/v1/ielts/lessons/:id
 DELETE  /api/v1/ielts/lessons/:id

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/lessons",
  ieltsLessonRoutes
);


/*
--------------------------------------------------------
 IELTS QUESTIONS
--------------------------------------------------------

 GET     /api/v1/ielts/questions
 GET     /api/v1/ielts/questions/:id
 POST    /api/v1/ielts/questions
 PUT     /api/v1/ielts/questions/:id
 DELETE  /api/v1/ielts/questions/:id

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/questions",
  ieltsQuestionRoutes
);


/*
--------------------------------------------------------
 IELTS PRACTICE TESTS
--------------------------------------------------------

 GET     /api/v1/ielts/tests
 GET     /api/v1/ielts/tests/:id
 POST    /api/v1/ielts/tests
 PATCH   /api/v1/ielts/tests/:id
 DELETE  /api/v1/ielts/tests/:id

 PATCH   /api/v1/ielts/tests/:id/publish
 PATCH   /api/v1/ielts/tests/:id/unpublish

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/tests",
  ieltsPracticeTestRoutes
);


/*
--------------------------------------------------------
 IELTS TEST / ATTEMPT MANAGEMENT
--------------------------------------------------------

 IMPORTANT:

 This route is kept AFTER the practice-test router.

 It handles endpoints such as:

 POST
 /api/v1/ielts/tests/:testId/attempt

 PATCH
 /api/v1/ielts/tests/:testId/attempt/:attemptId/answers

 GET
 /api/v1/ielts/tests/:testId/attempt/:attemptId

 POST
 /api/v1/ielts/tests/:testId/attempt/:attemptId/submit

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/tests",
  ieltsTestRoutes
);


/*
--------------------------------------------------------
 IELTS ATTEMPTS
--------------------------------------------------------

 /api/v1/ielts/attempts

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/attempts",
  ieltsAttemptRoutes
);


/*
--------------------------------------------------------
 IELTS TEST ATTEMPTS
--------------------------------------------------------

 /api/v1/ielts/attempts

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/attempts",
  ieltsTestAttemptRoutes
);


/*
--------------------------------------------------------
 IELTS RESULTS
--------------------------------------------------------

 /api/v1/ielts/results

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/results",
  ieltsResultRoutes
);


/*
--------------------------------------------------------
 IELTS PROGRESS
--------------------------------------------------------

 /api/v1/ielts/progress

--------------------------------------------------------
*/

app.use(
  "/api/v1/ielts/progress",
  ieltsProgressRoutes
);


/*
========================================================
 PTE ROUTES
========================================================
*/


/*
--------------------------------------------------------
 PTE LESSONS
--------------------------------------------------------

 /api/v1/pte/lessons

--------------------------------------------------------
*/

app.use(
  "/api/v1/pte/lessons",
  pteLessonRoutes
);


/*
--------------------------------------------------------
 PTE QUESTIONS
--------------------------------------------------------

 /api/v1/pte/questions

--------------------------------------------------------
*/

app.use(
  "/api/v1/pte/questions",
  pteQuestionRoutes
);


/*
--------------------------------------------------------
 PTE PRACTICE TESTS
--------------------------------------------------------

 /api/v1/pte/tests

--------------------------------------------------------
*/

app.use(
  "/api/v1/pte/tests",
  ptePracticeTestRoutes
);


/*
--------------------------------------------------------
 PTE TEST ATTEMPTS
--------------------------------------------------------

 /api/v1/pte/attempts

--------------------------------------------------------
*/

app.use(
  "/api/v1/pte/attempts",
  pteTestAttemptRoutes
);


/*
========================================================
 MOCK TESTS
========================================================
*/

app.use(
  "/api/v1/mock-tests",
  mockTestRoutes
);


/*
========================================================
 ANALYTICS
========================================================
*/

app.use(
  "/api/v1/analytics",
  analyticsRoutes
);


/*
========================================================
 AI
========================================================
*/

app.use(
  "/api/v1/ai",
  aiRoutes
);


/*
========================================================
 NOTIFICATIONS
========================================================
*/

app.use(
  "/api/v1/notifications",
  notificationRoutes
);


/*
========================================================
 REPORTS
========================================================
*/

app.use(
  "/api/v1/reports",
  reportRoutes
);


/*
========================================================
 ATTENDANCE REPORTS
========================================================
*/

app.use(
  "/api/v1/attendance-reports",
  attendanceReportRoutes
);


/*
========================================================
 FILE UPLOADS
========================================================
*/

app.use(
  "/api/v1/upload",
  uploadRoutes
);


/*
========================================================
 PASSWORD RESET (ADMIN OTP)
========================================================
*/

app.use(
  "/api/v1/admin/password-reset",
  passwordResetRoutes
);


/*
========================================================
 CONTACT FORM
========================================================
*/

app.use(
  "/api/v1/contact",
  contactRoutes
);


/*
========================================================
 HEALTH CHECK
========================================================
*/

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "AI IELTS & PTE LMS Backend is Running 🚀",
    });
  }
);


/*
========================================================
 API 404 HANDLER
========================================================
*/

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found.",
      path: req.originalUrl,
      method: req.method,
    });
  }
);


/*
========================================================
 GLOBAL ERROR HANDLER
========================================================
*/

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL API ERROR:",
      err
    );

    const statusCode =
      err.statusCode ||
      err.status ||
      500;

    res.status(statusCode).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error.",
    });
  }
);


/*
========================================================
 EXPORT
========================================================
*/

module.exports = app;