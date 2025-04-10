const express = require("express");
const router = express.Router();
const userController = require("../Controllers/LoginController.js");
const jwt = require('jsonwebtoken');


// Página de login
router.get("/", loginController.login);

// Autenticação de utilizador
router.post("/login", (req, res) => {
  const email= req.body.email;
  const rememberMe = req.body.rememberMe;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30d' });

  if (rememberMe) {
    // Se "Lembrar-me" estiver selecionado, configura os cookies com validade (persistent cookies)
    console.log('Definindo cookie rememberMe com email:', email);
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
    }, userController.authenticate);
  }
    
    return res.redirect('/');

    /* post login antigo
    const rememberMe = req.body.rememberMe;
    const email = req.body.email;
    if (rememberMe) {
        // Cria um cookie com o email do usuário
        res.cookie('email', email, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
          httpOnly: true, // Impede o acesso do JavaScript
          secure: process.env.NODE_ENV === 'production', // Use "secure" em produção
        });
      }

    req.flash("success_msg", "Login realizado com sucesso!");
    res.redirect("/");
    */
});

router.get("/logOut", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Erro ao fazer logout.");
        }
        res.clearCookie('auth_token');
        res.clearCookie('rememberMe');
        req.flash("success_msg", "Logout realizado com sucesso!");
        res.redirect("/");
    });
});

module.exports = router;
