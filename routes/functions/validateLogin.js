//Verifica se o utilizador já está autentificado se sim volta para trás
function possibleBlockLogin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        console.log("O utilizador já está autenticado");
        res.redirect(res.locals.previousPage);
    } else {
        next();
    }
}

module.exports = {
    possibleBlockLogin,
};