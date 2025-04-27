var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Models
const User = require("../../Models/Perfils/User");
const Perfil = require("../../Models/Perfils/Perfil");
const Restaurant = require("../../Models/Perfils/Restaurant");

//Constrollers
const signUpController = require("../SignUpController");
const { restaurantsPage } = require("../RestaurantsController");

var userController = {};

//Associar um dono ao seu restaurante, atraves do id do restaurante

userController.homePage = async function(req, res) {
    const priority = "all";
    const banned = "all";
    User.find({ 'perfil.priority': { $ne: "Admin" }}).exec()
        .then(function(users) {
            res.render("perfil/admin/PagesAdmin/Users/listUsers", {users: users, filters: {priority, banned}});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).render("errors/error", {numError: 500, error: "Problema a procurar pelos Users"});
        });
};

//função para renderizar a pagina de criar utilizadores
userController.createUser = function(req, res) {
    res.render("perfil/admin/PagesAdmin/Users/addUser");
}


userController.showUser = async function(req, res) {
    try {
        const userD = await User.findById(req.params.userId).exec();
        if (userD) {
            let restaurants = [];

            if(userD.perfil.priority === "Dono") {
                restaurants = await Restaurant.find( {_id: {$in: userD.perfil.restaurantIds } }).exec()
            }

            res.render("perfil/admin/PagesAdmin/Users/showUser", {userD: userD, restaurants: restaurants});
        } else {
            console.log("O utilizador não existe")
            res.status(404).render(res.locals.previousPage);
        }
    } catch(error) {
        console.log("Error: ", error)
        res.status(404).render(res.locals.previousPage);
    }
}

userController.search = async function(req, res) {
    try {
        let query = {};
        const firstName = req.query.firstName;
        const lastName = req.query.lastName;
        const priority = req.query.priority;
        const banned = req.query.banned;
        const order = req.query.order;

        if (firstName) {
            query.firstName = { "$regex": firstName, "$options": "i" };
        }
        
        if (lastName) {
            query.lastName = { "$regex": lastName, "$options": "i" };
        }
    
        if(priority !== "all") {
            query["perfil.priority"] = priority;
        } else {
            query["perfil.priority"] = { $ne: "Admin" };
        }
    
        if (banned === "Sim") {
            query["perfil.banned"] = true;
        } else if (banned === "false") {
            query["perfil.banned"] = false;
        }
    
        let sortObj = null;
        switch (order) {
            case 'nameAsc': {
                sortObj = { firstName: 1, lastName: 1 };
                break;
            } case 'nameDesc': {
                sortObj = { firstName: -1, lastName: -1 };
                break;
            } case 'prioridadeAsc': {
                sortObj = { 'perfil.priority': 1 };
                break;
            } case 'prioridadeDesc': {
                sortObj = { 'perfil.priority': -1 };
                break;
            } case 'desbannedDesc': {
                sortObj = { 'perfil.banned': 1 };
                break;
            } case 'bannedAsc': {
                sortObj = { 'perfil.banned': -1 };
                break;
            } default: {
                break;
            }
        }
        
        let users = null;    
        if (sortObj) {
            users = await User.find(query).sort(sortObj).exec(); 
        } else {
            users = await User.find(query).exec();
        }
        
        if(!users) {
            res.status(400).render("errors/error400");
        }

        res.render("perfil/admin/PagesAdmin/Users/listUsers", {users: users, filters: {firstName, lastName, priority, banned, order}});
    } catch(error) {
        console.error("Erro ao filtrar pelos restuarantes: ", error);
        res.status(500).render("errors/error", {numError: 500, error: error});
    }
};

//Função para encontrar um restaurante pelo nome na base de dados
userController.findOneRestaurante = async function(name) {
    try {
        return await Restaurant.findOne( {name: name});
    } catch (err) {
        console.log(err);
        return null;
    }
}

//Função para validar se o utilizador existe
async function validateNewUser(email, phoneNumber, priority, restaurant) {
    if (priority === "Dono" && !restaurant) {
        return "Não existe nenhum restaurante(s) com esse(s) nome(s)!"
    }

    const existingUser = await User.findOne({
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();
    
    const existingEmailRestaurant = await Restaurant.findOne({
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();

    if (existingUser) {
        if (existingUser.perfil.email === email) {
            return "Já existe uma conta com este email!";
        } else {
            return "Já existe uma conta com esse numero telefonico!";
        }
    } 
    
    if(existingEmailRestaurant && priority !== "Dono") {
        if (existingEmailRestaurant.perfil.email === email) {
            return "Já existe uma conta com este email!";
        } else {
            return "Já existe uma conta com esse numero telefonico!";
        }
    }

    return "";
}

function validationSave(firstName, lastName, email, phoneNumber, password, confirmPassword, priority, restaurant) {
    let errors = [];

    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
        errors.push({ texto: "Todos os campos são obrigatórios!" });
    }

    if(priority === "Dono" && !restaurant) {
        errors.push({ texto: "Quando a prioridade é dono, o campo restaurante é de preenchimento obrigatório"})
    }

    if (password.length < 8 || confirmPassword.length < 8) {
        errors.push({ texto: "A senha deve ter pelo menos 8 caracteres!" });
    }

    if (password !== confirmPassword) {
        errors.push({ texto: "As senhas não coincidem!" });
    }
    return errors;
}

//Função para validar se o restaurante existe
async function restaurantsSemDuplciacoes(restaurants, priority) {
    if (priority ==="Dono" && !Array.isArray(restaurants)) {
        restaurants = [restaurants];
    }

    let error = false;
    let i = 0;
    //Remove os duplicados do array
    while(i < restaurants.length && !error) {
        if(restaurants[i]) {
            for (let y = restaurants.length - 1; y > i; y--) {
                if (restaurants[i].name === restaurants[y].name) {
                    restaurants.splice(y, 1);
                }
            }
        } else {
            error = true;
        }
        i++;
    }
    
    if(error) {
        throw new Error("Existe algum campo de restaurante por preencher!");
    }
    //Transformamos o array restaurantes, de um array de objetos para um array só com os nomes
    console.log("Restaurantes: ", restaurants)
    let namesRestaurants = [];
    for (let i = 0; i < restaurants.length; i++) {
        namesRestaurants[i] = restaurants[i].name;
    }

    return namesRestaurants;
}
/**
 * Metodo para criar um novo utilizador
 * 
 * Alterar para agora procurar pelos restuarantes que estão num array
 * 
 */
userController.saveUser = async function(req, res) {
    try {    
        const { firstName, lastName, email, phoneNumber, password, confirmPassword, priority} = req.body;  
        const restaurantsNames = req.body.restaurant;
        
        let restaurants;
        try {
            restaurants = await restaurantsSemDuplciacoes(restaurantsNames, priority);
        } catch (err) {
            console.error("Existe um restaurante que não foi preenchido:", err.message);
            return res.status(404).render(res.locals.previousPage);
        }
        
        const errors = validationSave(firstName, lastName, email, phoneNumber, password, 
            confirmPassword, priority, restaurants);

        if (errors.length > 0) {
            return res.status(404).render("perfil/admin/pagesAdmin/Users/addUser", { errors, firstName, 
                lastName, email });
        }

        let restaurantFound = await Restaurant.find({ name: {$in: restaurants}}).exec();
        
        const errorValidate = await validateNewUser(email, phoneNumber, priority, restaurantFound);
        
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            return res.redirect(res.locals.previousPage);
        } 

        // Encriptação da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        let perfil;

        if (restaurants) {
            let restaurantsIds = []; 

            for(let i = 0; i < restaurantFound.length; i++) {
                restaurantsIds[i] = restaurantFound[i]._id;
            }
            
            perfil = new Perfil({
                phoneNumber: phoneNumber,
                email: email,
                password: hashedPassword,
                priority: priority,
                restaurantIds: restaurantsIds,
            });
        } else {
            perfil = new Perfil({
                phoneNumber: phoneNumber,
                email: email,
                password: hashedPassword,
                priority: priority,
            });
        }

        let newUser = new User({
            firstName: firstName,
            lastName: lastName,
            perfil: perfil,
            password: hashedPassword
        });

        await newUser.save();
        
        if(restaurants) {
            for(let i = 0; i < restaurantFound.length; i++) {
                restaurantFound[i].perfil.ownersIds.push(newUser._id);
                await restaurantFound[i].save();
            }
        }
        req.flash("success_msg", "Registo realizado com sucesso!");
        res.redirect("/perfil/admin/listUsers");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Erro ao criar o utilizador. Tente novamente.");
        res.redirect(res.locals.previousPage);
    }
}

userController.editPage = function(req, res) {    
    User.findOne({ _id: req.params.userId }).exec()
        .then(user => {     
            if(user.perfil.priority === "Dono" && user.perfil.restaurantIds) {
                Restaurant.find( {_id: { $in: user.perfil.restaurantIds }} ).exec()
                    .then(restaurants => {

                        if(restaurants && restaurants.length > 0) {
                            res.render("perfil/admin/PagesAdmin/Users/editUser", {userD: user, restaurants: restaurants});    
                        } else{
                            res.render("perfil/admin/PagesAdmin/Users/editUser", {userD: user, restaurants: []});    
                        }
                     })
                    .catch(error => {
                        console.log("Erro: ", error);
                        res.redirect("perfil/admin/listUsers");
                    });
            } else {
                res.render("perfil/admin/PagesAdmin/Users/editUser", {userD: user, restaurants: []});
            }
        })
        .catch(error => {
            console.log("Erro: ", error);
            res.redirect("/perfil/admin/listUsers");
        });
}

async function validateUpdateUser(user, email, phoneNumber, priority, restaurant) {
    if (priority === "Dono" && !restaurant) {
        return "Não existe nenhum restaurante com esse nome!"
    }

    const existingUser = await User.findOne({
        _id: { $ne: user._id },
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();

    if (existingUser) {
        if (existingUser.perfil.email === email) {
            return "Já existe um utilizador com esse email!";
        } else {
            return "Já existe um utilizador com esse numero telefonico!";
        }
    }

    return "";
}

function validationUpdate(firstName, lastName, email, phoneNumber, priority, restaurant) {
    let errors = [];

    if (!firstName || !lastName || !email || !phoneNumber) {
        errors.push({ texto: "Todos os campos são obrigatórios!" });
    }

    if(priority === "Admin" && !restaurant) {
        errors.push({ texto: "Quando a prioridade é admin, o campo restaurante é de preenchimento obrigatório"})
    }

    return errors;
}
/**
 * Metodo que atualiza os dados do utilizador
 */
userController.updateUser =  async function(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber, priority} = req.body;  

        const restaurantsNames = req.body.restaurant;
        //Retiramos os restaurants duplicados
        let restaurants;
        try {
            restaurants = await restaurantsSemDuplciacoes(restaurantsNames, priority);
        } catch (err) {
            console.error("Existe um restaurante que não foi preenchido:", err.message);
            return res.status(404).render(res.locals.previousPage);
        }
    
        //Validações aos campos
        let errors = await validationUpdate(firstName, lastName, email, phoneNumber, priority, restaurants);
        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
    
        let restaurantFound = await Restaurant.find({ name: { $in: restaurants}}).exec();
        console.log("Restaurantes encontrados: ", restaurantFound);
        let user = await User.findOne({ _id: req.params.userId }).exec();
 
        //Está aqui um problema
        let errorValidate = await validateUpdateUser(user, email, phoneNumber, priority, restaurantFound);
    
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            console.log("Error: ", errorValidate);
            return res.redirect(res.locals.previousPage);
        }

        if (restaurants && restaurants.length > 0) {
            let foundIds = [];
            let restIds = [];

            for (let i = 0; i < restaurantFound.length; i++) {
                restIds.push(restaurantFound[i]._id);
                foundIds.push(restaurantFound[i]._id.toString());
            }

            if (user.perfil.priority !== "Dono" && priority === "Dono") {
                user.perfil.restaurantIds = restIds;

                // Adiciona dono nos restaurantes
                await Restaurant.updateMany(
                    { _id: { $in: user.perfil.restaurantIds } },
                    { $addToSet: { 'perfil.ownersIds': user._id } }
                ).exec();
            } else if (user.perfil.priority === "Dono" && priority === "Dono") {

                console.log("Já sou Dono");

                //Procuramos por novos restaurantes
                let oldIds = [];
                for(const rest of user.perfil.restaurantIds) {
                    oldIds.push(rest._id.toString());
                }
                console.log("Old Ids: ", oldIds);
                
                let newRestIds = []; 
                for(const rest of restaurantFound) {
                    const id = rest._id.toString();
                    if(!oldIds.includes(id)) {
                        newRestIds.push(rest._id)
                    }
                }

                let removeIds = []
                for(const rest of user.perfil.restaurantIds) {
                    const id = rest._id.toString();
                    if(!foundIds.includes(id)) {
                        removeIds.push(rest._id)
                    }
                }

                user.perfil.restaurantIds = restIds;
                await user.save();
                if(newRestIds.length > 0) {
                    //Adicionamos os novos donos aos restaurantes
                    await Restaurant.updateMany(
                        { _id: {$in: newRestIds}},
                        { $addToSet: { 'perfil.ownersIds': user._id } }
                    )
                }
                
                //Novo array de restaurants
                if(removeIds.length > 0) {
                    //Removemos os id do ownersIds dos que foram removidos
                    await Restaurant.updateMany(
                        { _id: { $in: removeIds} },
                        { $pull: { 'perfil.ownersIds': user._id } }
                    ).exec();
                }

            }
        }

        //Caso o user fosse dono e agora deixou de ser.
        if (user.perfil.priority === "Dono" && priority !== "Dono") {
            console.log("A prioridade foi alterada de dono para cliente")
            
            await Restaurant.updateMany(
                { _id: { $in: user.perfil.restaurantIds } },
                { $pull: { 'perfil.ownersIds': user._id } }
            ).exec();

            //Forma que encontrei para dar delete no campo
            user.perfil.restaurantIds = undefined;
            await user.save();
        }  
        
        //update
        user.firstName = firstName;
        user.lastName = lastName;
        user.perfil.email = email;
        user.perfil.phoneNumber = phoneNumber;
        user.perfil.priority = priority;
        
        //guardar as alterações
        await user.save()
        res.redirect("/perfil/admin/listUsers");
    } catch(err) {
        console.log(err);
        res.redirect(res.locals.previousPage);
    }    
}

//Função para apagar a imagem do utilizador
function deleteImg(imagePath) {
    imagePath = "public/" + imagePath;

    fs.unlink(imagePath, (err) => {
        if (err) {
            let erro = "Erro ao apagar a foto de perfil do user:" + err;
            console.error(erro);
            return res.status(500).render("errors/error", {numError: 500, error: erro});
        }

        console.log('Imagem apagada com sucesso');
    });
}

/**
 * Metodo delte User
 * Falta caso seja dono, retirar do array de owners dos restaurantes o id dele
 */
userController.deleteUser = async function(req, res) {
    try {
        const user = await User.findOne({ _id: req.params.userId }).exec();

        if (user) {
            let imagePath = user.perfil.perfilPhoto;
            
            if (user.perfil.priority === "Dono" && user.perfil.restaurantIds) {
                await Restaurant.updateMany(
                    { _id: { $in: user.perfil.restaurantIds } },
                    { $pull: { 'perfil.ownersIds': user._id } }
                ).exec();
            }

            await user.deleteOne();
            console.log("User eliminado com sucesso!");

            if (imagePath !== "") {
                deleteImg(imagePath);
            }

            res.redirect("/perfil/admin/listUsers");
        }
      } catch (error) {
        console.log("Erro ao eliminar o user: ", error);
        res.redirect("/perfil/admin/listUsers");
      }
}

//Função para remover o banimento de um user
userController.desban = function(req, res) {
    User.findOneAndUpdate( { _id: req.params.userId },
        {
            $set: {'perfil.banned': false },
        },
        { new: true })
        .exec()
        .then(updatedUser => {
            console.log("User banido!");
            res.redirect(res.locals.previousPage);
        })
        .catch(error => {
            console.error("Erro ao banir o user:", error);
            res.redirect(res.locals.previousPage);
        });
}

//Função para banir um user
userController.ban = function(req, res) {
    User.findOneAndUpdate( { _id: req.params.userId },
        {
            $set: { 'perfil.banned': true },
        },
        { new: true })
        .exec()
        .then(updatedUser => {
            console.log("User desbanido!");
            res.redirect(res.locals.previousPage);
        })
        .catch(error => {
            console.error("Erro ao desbanir o user:", error);
            res.redirect(res.locals.previousPage);
        });
}

module.exports = userController;