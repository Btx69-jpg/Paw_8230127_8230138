const express = require("express");
const router = express.Router();

// Página de checkout
router.get("/checkOut", function(req, res) {
    res.render("/checkOut");
});