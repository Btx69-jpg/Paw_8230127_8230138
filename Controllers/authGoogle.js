var GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/Perfils/User');
const Restaurant = require('../Models/Perfils/Restaurant');

//para o login
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/login"
  },
  function(accessToken, refreshToken, profile, cb) {
    //find or create (onde tem find findOrCreate)
    /*
    User.find({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
    */
    // Verifica se o usuário já existe no banco de dados
    User.find({ email: profile.emails }, function (err, user) {
        return cb(err, user);
      });
  }
));