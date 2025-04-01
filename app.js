var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Conexão com o Atlas (Não sei se tenho de fazer /DB)
mongoose.connect('mongodb+srv://UserGeral:1234@cluster0.rbiey8q.mongodb.net/', {useNewUrlParser: true})
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

/*
São os js que criei na pasta Route
*/
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var login = require('./routes/login'); 
var restaurant = require('./routes/RestaurantRoute');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Importante ter em consideração a autentificação e a autorização
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', login); /**Indico a barra que vai aparecer no url */
aap.use('/restaurant', restaurant); /**Indico a barra que vai aparecer no url */

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
