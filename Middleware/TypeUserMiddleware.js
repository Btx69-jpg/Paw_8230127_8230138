//Verifica se o user autenticado é um admin
function isAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Admin") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }

    } else {
        console.log("Não existe cookie para admin");
        res.render("errors/error", {numError: 403});
    }
}

//Verifica se o user autenticado é um cliente
function isCliente(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Cliente") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }
    } else {
        console.log("Não existe cookie para clientes");
        res.render("errors/error", {numError: 403});
    }
}

//Verifica se o user autenticado é um dono
function isDono(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Dono") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }
    } else {
        console.log("Não existe cookie para donos");
        res.render("errors/error", {numError: 403});
    }
}

//Verifica se o user autenticado é um restaurante
function isRestaurant(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Restaurant") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }
    } else {
        console.log("Não existe cookie para restaurantes");
        res.render("errors/error", {numError: 403});
    }
}

function isDonoOrRestaurant(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Dono" || cokkie === "Restaurant") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }
    } else {
        console.log("Não existe cookie para donos ou restaurantes");
        res.render("errors/error", {numError: 403});
    }
}

//Verifica se o user autenticado é um dono
function isDonoOrAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Dono" || cokkie === "Admin") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }
    } else {
        console.log("Não existe cookie para donos");
        res.render("errors/error", {numError: 403});
    }
}

//Verifica se o user autenticado é um admin, dono ou restaurante
function isDonoRestaurantOrAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Admin" || cokkie === "Dono" || cokkie === "Restaurant") {
            next();
        } else {
            res.render("errors/error", {numError: 403});
        }
    } else {
        console.log("Não existe cookie para donos ou restaurantes ou admin");
        res.render("errors/error", {numError: 403});
    }
}

module.exports = {
    isAdmin,
    isCliente,
    isDono,
    isRestaurant,
    isDonoOrRestaurant,
    isDonoOrAdmin, 
    isDonoRestaurantOrAdmin,
};