const express = require("express");
const router = express.Router();

//Depois criar um controller
router.get('/painel', (req, res) => {
  const userId = req.body;
  res.render('painel', { userId });
});


module.exports = router;