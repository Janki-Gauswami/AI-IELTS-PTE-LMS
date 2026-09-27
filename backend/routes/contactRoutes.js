const express = require("express");
const router = express.Router();

const { submitContactForm } = require("../controllers/contactController");

// Public contact form submission
router.post("/", submitContactForm);

module.exports = router;
