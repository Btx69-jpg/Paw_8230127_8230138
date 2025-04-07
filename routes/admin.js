const express = require("express");
const router = express.Router();

const adminController = require("../Controllers/AdminController.js");
// Página de checkout
router.get("/", function(req, res) {
    adminController.homePage(req, res);
});

router.get("/listRestaurants", function(req, res) {
    adminController.listRestaurants(req, res);
});

router.get("/listUsers", function(req, res) {
    adminController.listUsers(req, res);
});

router.get("/listCategories", function(req, res) {
    adminController.listCategories(req, res);
});

module.exports = router;