# AI-POWERED IELTS & PTE LEARNING MANAGEMENT SYSTEM

## PROJECT DOCUMENTATION

### Project Title

**AI-Powered IELTS & PTE Learning Management System**

### Project Type

Web-Based Learning Management System

### Technology

React, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, REST API, JWT

---

# 1. ABSTRACT

The AI-Powered IELTS & PTE Learning Management System is a web-based platform designed to help IELTS and PTE coaching institutes manage their students, teachers, batches, learning materials, attendance, academic progress, and performance analytics from a centralized system.

Traditional coaching institutes often manage student records, teacher assignments, attendance, learning resources, and performance data using separate systems or manual processes. This can result in duplicated work, difficulty tracking student progress, and limited access to meaningful performance information.

The proposed system provides separate dashboards and functionality for administrators, teachers, and students. Administrators can manage teachers, students, batches, and system-level information. Teachers can access their assigned batches and students, manage attendance, and monitor academic activities. Students can view their learning information, attendance, learning materials, and progress.

The system also provides AI-oriented features such as AI Band Prediction, Weakness Detection, and AI Study Planner to support personalized learning and performance improvement.

The application follows a modern client-server architecture using React for the frontend, Node.js and Express.js for the backend, and MongoDB for data storage.

---

# 2. INTRODUCTION

IELTS (International English Language Testing System) and PTE (Pearson Test of English) are widely used English-language proficiency examinations for students and professionals planning to study, work, or migrate internationally.

Coaching institutes need to manage a large amount of information related to students, teachers, batches, attendance, learning materials, examination modules, and performance.

A centralized Learning Management System can simplify these processes.

The AI-Powered IELTS & PTE LMS is designed to provide a single platform through which administrators, teachers, and students can interact with the educational system according to their roles.

The system combines Learning Management System functionality with AI-assisted academic features.

---

# 3. PROBLEM STATEMENT

Many coaching institutes rely on manual or disconnected systems for managing academic activities.

Common problems include:

* Manual student record management
* Difficulty managing teacher information
* Difficulty assigning teachers to batches
* Manual attendance management
* Difficulty tracking student attendance history
* Separate management of IELTS and PTE learning resources
* Limited performance analytics
* Difficulty identifying individual student weaknesses
* Lack of personalized study planning
* Difficulty maintaining centralized academic records

Therefore, there is a need for an integrated web-based system that can manage these activities efficiently.

---

# 4. OBJECTIVES

The major objectives of the project are:

1. To develop a centralized LMS for IELTS and PTE coaching institutes.
2. To provide role-based access for Admin, Teacher, and Student users.
3. To manage student and teacher information efficiently.
4. To manage batches and teacher assignments.
5. To provide digital learning materials.
6. To manage IELTS and PTE learning modules.
7. To provide attendance management.
8. To provide attendance history and reports.
9. To provide academic analytics.
10. To predict potential IELTS/PTE performance using AI-assisted functionality.
11. To identify student weaknesses.
12. To provide an AI-assisted study planning mechanism.
13. To reduce manual administrative work.
14. To provide a scalable web-based architecture.

---

# 5. SCOPE OF THE PROJECT

The system is intended for IELTS and PTE coaching institutes.

The scope includes:

### Administrative Management

* Admin authentication
* Student management
* Teacher management
* Batch management
* Teacher assignment
* Student enrollment
* Attendance monitoring
* Reports and analytics

### Teacher Management

* Teacher dashboard
* Assigned batch viewing
* Student viewing
* Attendance marking
* Attendance history
* Academic monitoring

### Student Management

* Student authentication
* Student dashboard
* Attendance viewing
* Learning material access
* IELTS/PTE learning modules
* Progress monitoring

### AI-Based Features

* AI Band Prediction
* Weakness Detection
* AI Study Planner

---

# 6. EXISTING SYSTEM

In a traditional coaching institute, different activities may be managed using:

* Paper-based records
* Excel spreadsheets
* Messaging applications
* Separate learning platforms
* Manual attendance registers
* Manually maintained student records

These approaches can make it difficult to maintain consistency and provide centralized information.

---

# 7. PROPOSED SYSTEM

The proposed system provides an integrated web application where different users can access functionality according to their roles.

The main users are:

### Admin

Responsible for overall management.

### Teacher

Responsible for assigned batches, students, attendance, and academic activities.

### Student

Uses the platform for learning, attendance, and progress monitoring.

The proposed architecture centralizes data in MongoDB and exposes functionality through REST APIs.

---

# 8. USER ROLES

## 8.1 Admin

The Admin can:

* Login to the system
* Manage teachers
* Manage students
* Manage batches
* Assign teachers to batches
* Manage student enrollment
* View attendance
* View attendance reports
* Access analytics
* Manage system-level information

---

## 8.2 Teacher

The Teacher can:

* Login to the teacher portal
* View dashboard
* View assigned batches
* View assigned students
* Mark student attendance
* View attendance history
* Monitor academic information

Teachers are restricted to the batches assigned to them for attendance-related operations.

---

## 8.3 Student

The Student can:

* Login to the student portal
* View dashboard
* View attendance
* View attendance history/calendar
* Access learning materials
* Access IELTS/PTE learning modules
* View academic progress

Students cannot modify attendance records.

---

# 9. FUNCTIONAL REQUIREMENTS

## 9.1 Authentication

The system should support:

* Login
* Logout
* JWT-based authentication
* Protected routes
* Role-based authorization
* Admin authentication
* Teacher authentication
* Student authentication

---

## 9.2 Student Management

The system allows administrators to:

* Create students
* View students
* Edit students
* Manage student profiles
* Manage enrollment information
* Assign students to batches

---

## 9.3 Teacher Management

The system allows administrators to:

* Create teachers
* View teachers
* Edit teacher information
* Maintain employee IDs
* Store qualification
* Store specialization
* Store experience
* Store joining date
* Store teacher profile information

---

## 9.4 Batch Management

The system provides functionality to:

* Create batches
* Manage batch information
* Assign teachers
* Manage enrolled students
* Identify active/inactive batches

---

# 10. ATTENDANCE MANAGEMENT

Attendance is an important module of the LMS.

Teachers can select an assigned batch and mark attendance for students.

The system supports the following attendance statuses:

* Present
* Absent
* Late
* Excused

### Attendance Rules

The system implements business rules such as:

1. One attendance record per student per batch per date.
2. Future attendance cannot be marked.
3. Duplicate attendance cannot be created.
4. Teachers can mark attendance only for assigned batches.
5. Admin users can manage attendance records according to their permissions.
6. Students cannot modify attendance.
7. Attendance cannot be marked before the student's admission/joining date.
8. Attendance can be restricted to active batches.
9. Attendance modifications can be controlled using time-based rules.

### Attendance Reports

The system provides functionality for:

* Attendance history
* Attendance dashboard
* Attendance reports
* Student attendance summary
* Student attendance history
* Student attendance calendar
* Attendance data export

---

# 11. LEARNING MATERIAL MANAGEMENT

The LMS can provide digital learning materials for students.

Learning resources may include:

* Reading materials
* Listening resources
* Speaking resources
* Practice content
* IELTS resources
* PTE resources

The objective is to provide students with centralized access to learning content.

---

# 12. IELTS MODULE

The IELTS section is designed around the four major IELTS skills:

### Listening

Students can access listening-related learning and practice resources.

### Reading

Students can access reading practice and learning materials.

### Writing

The system provides a dedicated area for writing-related learning activities.

### Speaking

The system provides speaking-related learning resources and activities.

---

# 13. PTE MODULE

The system also provides PTE-related learning functionality.

The PTE module is designed to provide students with access to basic PTE learning and practice resources.

---

# 14. AUDIO RECORDING

The system includes audio recording functionality to support speaking-related activities.

Audio recording can be used for:

* Speaking practice
* Student responses
* Practice activities
* Academic evaluation workflows

---

# 15. ANALYTICS DASHBOARD

The analytics functionality provides information that can help administrators and teachers understand academic performance.

Possible analytics include:

* Student performance
* Attendance statistics
* Batch-level statistics
* Progress information
* Performance trends

Charts and dashboard components can be used to present this information visually.

---

# 16. AI BAND PREDICTION

The system includes an AI-oriented Band Prediction feature.

The purpose of this feature is to analyze available student performance information and provide an estimated band/performance indication.

This can help students and teachers understand the student's current performance level.

The prediction is intended as an assistance mechanism and should not be treated as an official IELTS or PTE examination score.

---

# 17. WEAKNESS DETECTION

The Weakness Detection feature is intended to identify areas where a student may require additional practice.

For example, a student's performance data may indicate weaknesses in:

* Listening
* Reading
* Writing
* Speaking

The feature can help teachers and students focus their preparation on areas requiring improvement.

---

# 18. AI STUDY PLANNER

The AI Study Planner is intended to provide students with a structured preparation plan.

The plan can consider:

* Target examination
* Target band
* Current performance
* Weak areas
* Available preparation time
* Learning priorities

The objective is to provide a more personalized preparation approach.

---

# 19. TECHNOLOGY STACK

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Icons

## Backend

* Node.js
* Express.js
* Mongoose
* JWT
* bcrypt
* CORS
* cookie-parser
* dotenv

## Database

* MongoDB

## Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman
* MongoDB
* Chrome Developer Tools

---

# 20. SYSTEM ARCHITECTURE

The system follows a client-server architecture.

```text
                    USERS
                      │
          ┌───────────┼───────────┐
          │           │           │
        ADMIN       TEACHER     STUDENT
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
              REACT FRONTEND
                  (Vite)
                      │
                  Axios/API
                      │
                      ▼
              NODE.JS + EXPRESS
                   BACKEND
                      │
             Authentication
             Authorization
             Business Logic
                      │
                      ▼
                  MONGOOSE
                      │
                      ▼
                  MONGODB
```

---

# 21. PROJECT STRUCTURE

The project is organized into separate frontend and backend applications.

```text
AI-IELTS-PTE-LMS/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── data/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── ai-service/
    └── AI-related functionality
```

---

# 22. BACKEND ARCHITECTURE

The backend follows a controller-route-model architecture.

```text
Frontend
   │
   ▼
Routes
   │
   ▼
Middleware
   │
   ▼
Controllers
   │
   ▼
Models
   │
   ▼
MongoDB
```

### Routes

Routes define API endpoints.

Examples:

```text
/api/v1/auth
/api/v1/students
/api/v1/teachers
/api/v1/batches
/api/v1/enrollments
/api/v1/attendance
```

### Controllers

Controllers contain business logic for operations such as:

* Authentication
* Student management
* Teacher management
* Batch management
* Attendance management
* Reports

### Models

Mongoose models define database structures.

---

# 23. DATABASE DESIGN

Important database entities include:

## User

Stores common authentication and account information.

Important fields include:

* name
* email
* phone
* password
* role
* profilePicture
* isActive
* createdAt
* updatedAt

Roles include:

```text
admin
teacher
student
```

---

## StudentProfile

Stores student-specific information.

Important fields include:

* userId
* enrollmentNumber
* dateOfBirth
* gender
* address
* emergencyContact
* targetExam
* targetBand
* targetCountry
* goal
* joinedDate
* status

---

## TeacherProfile

Stores teacher-specific information.

Examples include:

* user reference
* employee ID
* qualification
* specialization
* experience
* joining information
* profile information

---

## Batch

Stores batch-related information including:

* batch name
* assigned teachers
* students/enrollments
* status
* batch-related configuration

---

## Enrollment

Maintains the relationship between students and batches.

---

## Attendance

Stores attendance information such as:

* student
* teacher
* batch
* date
* status
* remarks
* markedBy

---

# 24. API DOCUMENTATION

## Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

---

## Attendance

```text
POST   /api/v1/attendance
GET    /api/v1/attendance
GET    /api/v1/attendance/:id
PUT    /api/v1/attendance/:id
DELETE /api/v1/attendance/:id
```

Student attendance endpoints include:

```text
GET /api/v1/attendance/student/summary
GET /api/v1/attendance/student/history
GET /api/v1/attendance/student/calendar
```

Attendance dashboard/report functionality includes dedicated endpoints according to the implemented route structure.

---

# 25. AUTHENTICATION AND AUTHORIZATION

The system uses JWT-based authentication.

After successful login, the authenticated user's identity is used to protect restricted routes.

Protected backend routes use authentication middleware.

Role-based authorization restricts functionality according to the user's role.

For example:

```text
Admin
  ↓
Full administrative functionality

Teacher
  ↓
Assigned teaching functionality

Student
  ↓
Student learning functionality
```

---

# 26. ATTENDANCE AUTHORIZATION FLOW

The attendance workflow follows:

```text
Teacher Login
      ↓
Select Assigned Batch
      ↓
Load Students
      ↓
Select Attendance Status
      ↓
Submit Attendance
      ↓
Backend Authentication
      ↓
Check Student
      ↓
Check Batch
      ↓
Check Batch Status
      ↓
Check Teacher Assignment
      ↓
Check Date
      ↓
Check Duplicate Record
      ↓
Save Attendance
      ↓
MongoDB
```

---

# 27. FRONTEND ARCHITECTURE

The React frontend is divided into reusable components and pages.

Major frontend areas include:

```text
components/
pages/
services/
data/
```

### Components

Reusable interface components such as:

* Sidebar
* TopNavbar
* DashboardLayout
* AttendanceCharts
* Hero
* Other UI components

### Pages

Pages are organized according to user roles.

```text
Admin/
Teacher/
Student/
```

### Services

API communication is separated into service files.

Examples:

```text
attendanceService.js
attendanceDashboardService.js
attendanceReportService.js
studentAttendanceService.js
teacherDashboardService.js
```

---

# 28. DASHBOARDS

## Admin Dashboard

Provides administrative information and navigation to management modules.

## Teacher Dashboard

Provides access to:

* Dashboard
* My Batches
* My Students
* Attendance
* Attendance History
* Classes

## Student Dashboard

Provides student-oriented access to:

* Learning
* Attendance
* Progress
* Learning materials
* Academic information

---

# 29. PROJECT WORKFLOW

The overall workflow is:

```text
User
 ↓
Login
 ↓
JWT Authentication
 ↓
Role Identification
 ↓
Role-Based Dashboard
 ↓
Access Authorized Modules
 ↓
Frontend API Request
 ↓
Express Route
 ↓
Middleware
 ↓
Controller
 ↓
Mongoose Model
 ↓
MongoDB
 ↓
Response
 ↓
React UI
```

---

# 30. SECURITY

Security mechanisms used in the application include:

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Role-based authorization
* Input validation
* Environment variables for configuration
* CORS configuration
* Authentication middleware

Sensitive values such as database credentials and JWT secrets should be stored in environment variables rather than directly in source code.

---

# 31. TESTING

The application can be tested at multiple levels.

## Authentication Testing

Test cases include:

* Valid login
* Invalid email
* Invalid password
* Unauthorized access
* Role-based access

## Student Testing

Test:

* Create student
* Edit student
* View student
* Enrollment

## Teacher Testing

Test:

* Create teacher
* Edit teacher
* View teacher
* Teacher assignment

## Attendance Testing

Test:

* Mark Present
* Mark Absent
* Mark Late
* Mark Excused
* Prevent duplicate attendance
* Prevent future attendance
* Validate assigned batch
* Validate active batch
* Validate student
* Validate admission date

## API Testing

REST APIs can be tested using Postman.

---

# 32. ERROR HANDLING

The application provides error responses when operations cannot be completed.

Examples include:

```text
Student not found.
Batch not found.
Invalid attendance status.
Future attendance cannot be marked.
Attendance already marked for this student.
You are not assigned to this batch.
Attendance can only be marked for active batches.
```

The frontend displays appropriate error messages to users.

---

# 33. INSTALLATION AND SETUP

## Backend Setup

Open the terminal:

```bash
cd backend
npm install
```

Create the required `.env` configuration.

Example:

```text
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai_ielts_pte_lms
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run dev
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend communicates with the backend through the configured API base URL.

---

# 34. VERSION CONTROL

Git and GitHub are used for source-code version control.

The project repository maintains the frontend and backend source code and tracks development changes.

Typical workflow:

```bash
git status
git add .
git commit -m "Update project features"
git push origin main
```

---

# 35. LIMITATIONS

The current system has some limitations.

These may include:

* AI predictions depend on the available performance data.
* AI-generated recommendations may require further refinement.
* Advanced real-time pronunciation analysis is not included.
* Fully automated IELTS Writing band scoring is not included.
* ChatGPT-level conversational speaking partner functionality is not included.
* AI-generated adaptive tests are not included.
* Some advanced AI functionality may require additional model/service integration.

---

# 36. FUTURE ENHANCEMENTS

Future versions can include:

1. Advanced AI speaking evaluation.
2. Real-time pronunciation analysis.
3. More accurate band prediction models.
4. Advanced writing evaluation.
5. AI-generated adaptive tests.
6. Advanced student performance prediction.
7. Automated notifications.
8. Email/SMS notifications.
9. Mobile application.
10. Advanced teacher analytics.
11. Parent/guardian portal.
12. Online examination system.
13. Advanced question bank management.
14. More detailed AI-based personalized learning.

---

# 37. EXPECTED BENEFITS

The proposed LMS provides several benefits:

* Centralized student management
* Reduced manual work
* Better teacher management
* Easier batch management
* Digital attendance
* Improved attendance tracking
* Centralized learning materials
* Better academic monitoring
* Role-based access
* AI-assisted student analysis
* Personalized study planning
* Improved accessibility of academic information

---

# 38. SCREENSHOTS

The final documentation should include screenshots of the implemented system.

Recommended screenshots:

### Authentication

* Login page

### Admin

* Admin dashboard
* Student management
* Add student
* Teacher management
* Add teacher
* Batch management
* Attendance history
* Attendance reports

### Teacher

* Teacher dashboard
* My Batches
* My Students
* Take Attendance
* Attendance History

### Student

* Student dashboard
* Student attendance
* Attendance calendar
* Learning materials
* IELTS modules
* PTE modules

### Analytics

* Analytics dashboard
* Attendance charts
* AI Band Prediction
* Weakness Detection
* AI Study Planner

---

# 39. CONCLUSION

The AI-Powered IELTS & PTE Learning Management System provides an integrated platform for managing the academic and administrative activities of IELTS and PTE coaching institutes.

The system brings together student management, teacher management, batch management, enrollment, learning resources, attendance, analytics, and AI-assisted academic features into a single web-based platform.

The role-based architecture ensures that administrators, teachers, and students can access functionality appropriate to their responsibilities.

The use of React, Node.js, Express.js, MongoDB, REST APIs, and JWT provides a modern foundation for the application.

The AI-oriented features provide additional opportunities for personalized learning, performance analysis, weakness identification, and study planning.

Overall, the system aims to reduce manual administrative work, improve academic monitoring, centralize information, and provide a more organized learning experience for IELTS and PTE students.

---

# 40. PROJECT SUMMARY

| Category                | Details                                            |
| ----------------------- | -------------------------------------------------- |
| Project                 | AI-Powered IELTS & PTE LMS                         |
| Application Type        | Web Application                                    |
| Frontend                | React + Vite                                       |
| Styling                 | Tailwind CSS                                       |
| Backend                 | Node.js + Express.js                               |
| Database                | MongoDB                                            |
| ODM                     | Mongoose                                           |
| Authentication          | JWT                                                |
| Password Security       | bcrypt                                             |
| API                     | REST API                                           |
| Main Users              | Admin, Teacher, Student                            |
| AI Features             | Band Prediction, Weakness Detection, Study Planner |
| Main Management Modules | Students, Teachers, Batches, Enrollment            |
| Academic Modules        | IELTS, PTE, Learning Materials                     |
| Monitoring              | Attendance, Analytics, Reports                     |
| Version Control         | Git + GitHub                                       |

---

# END OF PROJECT DOCUMENTATION
