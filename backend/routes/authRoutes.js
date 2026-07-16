const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const { login,
        logout,
        getCurrentUser,
 } = require("../controllers/authController");

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", protect, getCurrentUser);

module.exports = router;