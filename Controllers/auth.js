const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

require('../Models/Perfils/User');
const User = mongoose.model('User');
const AddressOrder = require("../Models/Reusable/AddressOrder");
const Perfil = require("../Models/Reusable/Perfil");
const userController = require("./LoginController.js");


module.exports = function(passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField:"password" }, async (email, password, done) => {
        User.findOne({ 'perfil.email': email }).then(user => {
            if (!user) {
                return done(null, false, { message: 'Esta conta não existe!' });
            }

            bcrypt.compare(password, user.perfil.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorreta!' });
                }
            });      
        })
            
    }))

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
