//Verifica se o user autenticado é um admin
function isAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Admin") {
            next();
        } else {
            res.render("errors/error500", {error: "O user não existe ou não tem permissões para aceder há página"})
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

//Verifica se o user autenticado é um cliente
function isCliente(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Cliente") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

//Verifica se o user autenticado é um dono
function isDono(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Dono") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

//Verifica se o user autenticado é um restaurante
function isRestaurant(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Restaurante") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

function isDonoOrRestaurant(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Dono" || cokkie === "Restaurante") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

//Verifica se o user autenticado é um admin, dono ou restaurante
function isDonoRestaurantOrAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Admin" || cokkie === "Dono" || cokkie === "Restaurante") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

module.exports = {
    isAdmin,
    isCliente,
    isDono,
    isRestaurant,
    isDonoOrRestaurant,
    isDonoRestaurantOrAdmin,
};