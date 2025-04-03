// Description: Middleware to check if the user is an admin, util para proteger rotas, neste caso, o menu admin
module.exports = {
    isAdmin: function(req, res, next) {
        if (req.user && req.user.perfil.priority === 1) { // 1 ou Admin
            return next();
        } else {
            
        }
        req.flash('error_msg', 'Deve ser Admin para aceder a esta página.');
        res.redirect('/');
    }
}