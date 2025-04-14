var express = require('express');
var router = express.Router();
const auth = require('../Middleware/AutoLoginMiddleware');

router.get('/', (req, res) => {
  auth.autoLoginMiddleware;
  res.render('index');
});

/*
app.get('/outraPagina', (req, res) => {
  const user = req.session.user; // ou como você estiver armazenando o usuário
  const currentPage = 'outraPagina';
  const previousPage = req.headers.referer || '/';
  
  res.render('outraPagina', { user, currentPage, previousPage });
});
*/

module.exports = router;
