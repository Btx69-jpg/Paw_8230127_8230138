const mongoose = require("mongoose");
const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require("../Models/Perfils/User");
const Restaurant = require("../Models/Perfils/Restaurant");
const loginController = {};

// Renderiza página de login
loginController.login = function(req, res) {
    res.render("login/login");
};

// Autentica o utilizador
loginController.authenticate = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })(req, res, next);
};

//Aqui pode não haver erro, pois ele vai até ao return
loginController.loginToken = async function(req, res) {
  const email = req.body.email;
  let userId = "";
  let name = "";
  const user = await User.findOne({ 'perfil.email': email }).exec();

  if (user) {
    userId = user._id.toString();
    name = user.firstName;
  } else {
    // Se não encontrou o usuário, tenta encontrar o restaurante
    const rest = await Restaurant.findOne({ 'perfil.email': email }).exec();
    if (rest) {
      userId = rest._id.toString();
      name = rest.name;
    }
  }

  if (userId === "") {
    return res.status(403).end();
  }    

  const rememberMe = req.body.rememberMe;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30d' });

  console.log(token)
  if (rememberMe) {
    // Se "Lembrar-me" estiver selecionado, configura os cookies com validade (persistent cookies)
    console.log('Definindo cookie rememberMe com _id:', email);
    res.cookie('rememberMe', email, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      httpOnly: true,
      //secure: false
      secure: process.env.NODE_ENV === 'production'
    });
    console.log('Definindo cookie auth_token')
    res.cookie('auth_token', token, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      httpOnly: true,
      //secure: false 
      secure: process.env.NODE_ENV === 'production'
    });
  } else {
    // Se não estiver marcado, limpa o cookie "rememberMe"
    res.clearCookie('rememberMe');
    // Aqui definimos o cookie "auth_token" sem maxAge, tornando-o um cookie de sessão
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }, loginController.authenticate);
  }


  return res.redirect('/');
}

loginController.logout = function(req, res) {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.render('errors/error500', {error: "Erro ao fazer logout."});
        }

        res.clearCookie('auth_token');
        res.clearCookie('rememberMe');
        req.flash("success_msg", "Logout realizado com sucesso!");
        res.redirect("/");
    });
}

module.exports = loginController;
