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


//Conexão com o Atlas (Não sei se tenho de fazer /DB)
mongoose.connect('mongodb+srv://UserGeral:1234@cluster0.rbiey8q.mongodb.net/TrabalhoPAW', {
  useNewUrlParser: true,
  })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

/*
São os js que criei na pasta Route
*/
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var login = require('./routes/login'); 
var signUp = require('./routes/signup'); 
var restaurants = require('./routes/restaurants'); // Aqui carrego o controller que quero usar
var restaurant = require('./routes/restaurant');

var app = express();

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

//Importante ter em consideração a autentificação e a autorização
//Caminho até ao browser
app.use('/', indexRouter); //Aqui é quando meto apenas o localhost:3000
app.use('/users', usersRouter); //Aqui é quando é localhost:3000/users 
app.use('/login', login); 
app.use('/signUp', signUp); 
app.use('/restaurants', restaurants); //Aparece a pagina noraml dos restaurantes
app.use('/restaurants', restaurant); //Aqui tenho de meter o /restaurants, porque o proximo é um id que pode ter qualquer valor. (Ou seja não existe o /, no route)

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