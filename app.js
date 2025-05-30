//var swaggerUi = require('swagger-ui-express');
//var swaggerDocument = require('./swagger/swagger.json');
var express = require('express');
var session = require('express-session');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash');
const passport = require('passport');
require("./Controllers/auth")(passport); // Importa o arquivo auth.js e passa o passport como argumento
require('dotenv').config();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * O que o Angular tem permissão atualmente 
 */
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/** 
 * Este trecho de codigo permite ao angular ter acesso às
 * imagens guardadas na pasta publica
*/
app.use('/images', express.static('public/images'));

//Conexão com o Atlas
mongoose.connect('mongodb+srv://UserGeral:1234@cluster0.rbiey8q.mongodb.net/TrabalhoPAW', {
  useNewUrlParser: true,
  })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));


/*
São os js que criei na pasta Route
*/
var indexRouter = require('./routes/index');
var login = require('./routes/login'); 
var signUp = require('./routes/signup'); 
var restaurants = require('./routes/restaurants');
var registRestaurant = require('./routes/registRestaurant');
var checkOut = require('./routes/checkOut');
var perfil = require('./routes/perfil');

// Configuração da sessão (ajuste conforme necessário)
app.use(cookieParser());

app.use(session({
  secret: 'TrabalhoPaw',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

/**
 * * Middlewares
 * */

/**
 * * Middleware que faz o login automático do utilizador 
 * */
const autoLoginMiddleware = require('./Middleware/AutoLoginMiddleware');
app.use(autoLoginMiddleware);

/**
 * * Middleware para verificar quantos restaurantes estão pendentes de aprovação
 * */
const {notificationAproveRestaurante} = require('./Middleware/NavBarMiddleware');
app.use(notificationAproveRestaurante);

/**
 * * Middleware para tornar mensagens disponíveis em `res.locals`
 */
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use((req, res, next) => {
  // Se a requisição for para arquivos estáticos (imagens, CSS, JS), não redefine currentPage
  if (req.path.startsWith('/images') || req.path.startsWith('/css') || req.path.startsWith('/js')) {
    return next();
  }
  
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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Swagger
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger/swagger.json');

var userRouter = require("./routes/RestApi/user.js");
var logoutRouter = require("./routes/RestApi/logout.js");
var checkoutRouter = require("./routes/RestApi/checkout.js");
var cookiesRotuer = require("./routes/RestApi/cookies.js")
var cartRouter = require("./routes/RestApi/cart.js");

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/user', userRouter);
app.use('/api/v1/logout', logoutRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/api/v1/check', cookiesRotuer);
app.use('/api/v1/cart', cartRouter);


//Importante ter em consideração a autentificação e a autorização
//Caminho até ao browser
app.use('/', indexRouter); //Aqui é quando meto apenas o localhost:3000
app.use('/login', login); 
app.use('/signUp', signUp); 
app.use('/restaurants', restaurants); //Aparece a pagina noraml dos restaurantes
app.use('/registRestaurant', registRestaurant);
app.use('/perfil', perfil); //Pagina para renderizar o perfil
app.use('/checkOut', checkOut); //Aqui carrego o controller que quero usar


//* Middleware que mostra a pagina 404 personalizada
app.use((req, res, next) => {
  const isStatic = req.path.match(/\.(jpg|jpeg|png|gif|css|js|svg|ico|webp|woff2?|ttf)$/i);
  
  if (isStatic) {
    return res.sendStatus(404); 
  }

  res.status(404).render('errors/error404', {
    currentPage: req.path,
    user: req.user || null
  });
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
