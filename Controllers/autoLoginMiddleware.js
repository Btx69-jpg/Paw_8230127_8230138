const jwt = require('jsonwebtoken');
const User = require('../Models/Perfils/User');
const SECRET_KEY = process.env.JWT_SECRET;

async function autoLoginMiddleware(req, res, next) {
  // Se o usuário já estiver autenticado, passa para a próxima rota
  if (req.user) return next();

  // Verifique se existe o cookie auth_token
  if (req.cookies && req.cookies.auth_token) {
    const token = req.cookies.auth_token;
    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (!err && decoded && decoded.email) {
        try {
          const user = await User.findOne({ 'perfil.email': decoded.email });
          if (user) {
            // Registra o usuário na sessão sem redirecionar de forma intempestiva
            req.login(user, (loginErr) => {
              if (loginErr) {
                console.error("Erro no auto login:", loginErr);
                return next(); // Mesmo com erro, permite continuar para a rota
              }
              console.log("Auto login efetuado para:", decoded.email);
              req.login(user, (loginErr) => {
                if (loginErr) {
                    console.error("Erro ao logar automaticamente: ", loginErr);
                    return res.render('login/login', { email: emailSalvo, error: 'Erro ao fazer login automático' });
                }
                // Usuário autenticado e sessão iniciada; redirecione para a página desejada
                return res.redirect('/');
            });

            });
          } else {
            console.log("Usuário não encontrado para o email:", decoded.email);
            return next();
          }
        } catch (dbErr) {
          console.error("Erro ao buscar usuário:", dbErr);
          return next();
        }
      } else {
        console.log("Token inválido ou expirado.");
        return next();
      }
    });
  } else {
    // Se nenhum token for fornecido, passa para a próxima rota
    return next();
  }
}

module.exports = autoLoginMiddleware;