const jwt = require('jsonwebtoken');
const User = require('../Models/Perfils/User');
const Restaurant = require('../Models/Perfils/Restaurant');
const SECRET_KEY = process.env.JWT_SECRET;

async function autoLoginMiddleware(req, res, next) {
  if (req.user) return next();

  const token = req.cookies?.auth_token;
  const userType = req.cookies?.priority;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const Model = userType === 'Restaurant'
      ? Restaurant
      : User;

    const user = await Model.findById(decoded.userId).exec();
    if (!user) return next();

    req.login(user, (err) => {
      if (err) {
        console.error('Erro no auto login:', err);
      }
      next();
    });
  } catch (err) {
    console.error('Token inválido ou erro ao decodificar:', err);
    next();
  }
}

module.exports = autoLoginMiddleware;
