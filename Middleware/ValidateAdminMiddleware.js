//Models
const User = require('../Models/Perfils/User');

//JWT
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

async function validateAdmin(req, res, next) {
    try {
        const token = req.cookies?.auth_token;
        const userType = req.cookies?.priority;

        if (!token) {
            return res.status(403).render("errors/error", { numError: 403 });
        }
        
        const decoded = jwt.verify(token, SECRET_KEY);

        const user = await User.findById(decoded.userId).exec();
        if(!user) {
            console.log("Utilizador não encontrado")
            return res.status(404).render("errors/error", { numError: 404 });
        }

        if(userType === "Admin" && decoded.userId === user._id.toString()) {
            return next();
        }

        console.error('Não tem permissão para aceder a este restaurante:');
        return res.status(403).render("errors/error", {numError: 403});
    } catch (err) {
        console.error('Não tem permissão para aceder a este restaurante:', err);
        return res.status(403).render("errors/error", {numError: 403});
    }
}


module.exports = {
    validateAdmin
};