var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash');
const passport = require('passport');
const bcrypt = require('bcrypt');
require("./Controllers/auth")(passport); // Importa o arquivo auth.js e passa o passport como argumento

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Conexão com o Atlas (Não sei se tenho de fazer /DB)
mongoose.connect('mongodb+srv://UserGeral:1234@cluster0.rbiey8q.mongodb.net/TrabalhoPAW', { useNewUrlParser: true })
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err));



// Configuração da sessão (ajuste conforme necessário)
app.use(session({
  secret: 'TrabalhoPaw',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // ajuste para true se estiver usando HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Middleware para tornar mensagens disponíveis em `res.locals`
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use((req, res, next) => {
  res.locals.currentPage = req.path === '/' ? 'homepage' : req.path;
  res.locals.previousPage = req.headers.referer || '/';
  res.locals.user = req.user || null;

  console.log('User:', res.locals.user);
  console.log('Current Page:', res.locals.currentPage);
  console.log('Previous Page:', res.locals.previousPage);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
São os js que criei na pasta Route
*/
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const login = require('./routes/login');
const restaurant = require('./routes/RestaurantRoute');

// Importante ter em consideração a autentificação e a autorização
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', login); /**Indico a barra que vai aparecer no url */
app.use('/restaurant', restaurant); /**Indico a barra que vai aparecer no url */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;