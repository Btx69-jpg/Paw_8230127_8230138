var mongoose = require("mongoose");

//Models
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

//Controllers
var authtokenMiddleware = {};

//Metodo utilizado nas rotas onde os users têm de estar obrigatoriamente autenticados
authtokenMiddleware.authenticateToken = function(req, res, next) {
    const token = req.cookies.auth_token || req.headers['authorization'];

    console.log("Token: ", token);
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
          console.log("Erro token")
          return res.sendStatus(403); // Token inválido ou expirado
        }
        // Armazena as informações do usuário na requisição
        req.user = decoded;
        console.log("Req.user: ", req.user);
        next();
      });
};

module.exports = authtokenMiddleware;