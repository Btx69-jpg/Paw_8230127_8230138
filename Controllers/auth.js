const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../Models/Perfils/User');
const Restaurant = require('../Models/Perfils/Restaurant');

module.exports = function(passport) {
    passport.use(new localStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {

          //Procura primeiro em Users
          let user = await User.findOne({ 'perfil.email': email }).exec();
          
          //Se não existir, procura em Restaurants
          if (!user) {
            user = await Restaurant.findOne({ 'perfil.email': email }).exec();
            if (!user) {
              return done(null, false, { message: 'Esta conta não existe!' });
            }
          }
  
          //Verifica se está banido
          if (user.perfil.banned) {
            return done(null, false, { message: 'Conta banida.' });
          }
  
          //Compara a password (bcrypt.compare retorna booleano) :contentReference[oaicite:0]{index=0}
          const isMatch = await bcrypt.compare(password, user.perfil.password);
          if (!isMatch) {
            return done(null, false, { message: 'Password incorreta!' });
          }
  
          //Tudo OK então retornamos o user
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
          const user = await User.findById(id);
          done(null, user);
        } catch (err) {
          done(err);
        }
      });

}