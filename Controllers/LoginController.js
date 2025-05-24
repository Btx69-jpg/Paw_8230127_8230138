const mongoose = require("mongoose");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
const loginController = {};

// Renderiza página de login
loginController.login = function(req, res) {
  res.render("login/login");
};


//Cria o token e adiciona uma cokkie com o tipo de prioridade do user
loginController.loginToken = (req, res, next) => {
  // 1) Chama o passport e recebe (err, user, info)
  passport.authenticate('local', (err, user, info) => {
    
    if (err) {
      console.error("Erro ao autenticar:", err);
      req.flash('error', info.message);
      return res.redirect('/login');
    }

    if (!user) {
      // Mensagem de erro vinda do Strategy
      req.flash('error', info.message);
      return res.redirect('/login');
    }

    // 2) Faz o login na sessão
    req.login(user, loginErr => {
      if (loginErr) {
        console.error("Erro no req.login:", loginErr);
        req.flash('error', 'Erro ao fazer login. Tente novamente.');
        return res.redirect('/login');
      }

      // 3) Só após login bem‑sucedido é que geramos o token
      const payload = { userId: user._id };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '30d' });
      const remember = req.body.rememberMe;

      // 4) Define cookies
      if (remember) {
        res.cookie('auth_token', token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === 'production'
        });

        res.cookie('priority', user.perfil.priority, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      } else {
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        });

        res.cookie('priority', user.perfil.priority, {
          httpOnly: true,
        });
      }


      return res.redirect('/');
    });
  })(req, res, next);
};

loginController.logout = function(req, res) {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).render("errors/error", {numError: 500, error: "Erro ao fazer logout."});
        }

        res.clearCookie('auth_token');
        res.clearCookie('rememberMe');
        res.clearCookie('priority');
        req.flash("success_msg", "Logout realizado com sucesso!");
        res.redirect("localhost:3000");
    });
}

loginController.logoutAngular = function(req, res) {
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("------------------------------");

  req.logout((err) => {
      if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({error: "Erro ao fazer logout."});
      }

      res.clearCookie('auth_token');
      res.clearCookie('rememberMe');
      res.clearCookie('priority');
      req.flash("success_msg", "Logout realizado com sucesso!");
      return res.status(200).json({ message: "Logout realizado com sucesso!" });
  });
}
module.exports = loginController;
