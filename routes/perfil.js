var express = require('express');
var router = express.Router();

//Vai definir qual é que vai ser
router.get('/', (req, res) => {
    res.render('perfil/selectPageUser');
});

module.exports = router;
