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

userController.createUser = async function(req, res) {
    res.render("perfil/admin/PagesAdmin/Users/addUser");
}

userController.search = function(req, res) {
    let query = {};
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const priority = req.query.priority;
    const banned = req.query.banned;

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
    console.log(banned);

    if (banned === "Sim") {
        query["perfil.banned"] = true;
    } else if (banned === "false") {
        query["perfil.banned"] = false;
    }

    console.log(query)
    
    User.find(query).exec()
        .then(function (users) {
            res.render("perfil/admin/PagesAdmin/Users/listUsers", {users: users, filters: {firstName, lastName, priority, banned}});
        })
        .catch(function(err) {
            console.error("Erro ao filtrar pelos restuarantes: ", err);
            res.status(500).render("errors/error", {numError: 500, error: err});
        }); 
};

userController.findOneRestaurante = async function(name) {
    try {
        return await Restaurant.findOne( {name: name});
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function validateNewUser(email, phoneNumber, priority, restaurant) {
    if (priority === "Dono" && !restaurant) {
        return "Não existe nenhum restaurante com esse nome!"
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

    if(priority === "Admin" && !restaurant) {
        errors.push({ texto: "Quando a prioridade é admin, o campo restaurante é de preenchimento obrigatório"})
    }

    if (password.length < 8 || confirmPassword.length < 8) {
        errors.push({ texto: "A senha deve ter pelo menos 8 caracteres!" });
    }

    if (password !== confirmPassword) {
        errors.push({ texto: "As senhas não coincidem!" });
    }
    return errors;
}
/**
 * Metodo para criar um novo utilizador
 * 
 * Só não está a dar o countDonos, mas não é critico pois vai ser alterado pelo o ID do user
 */
userController.saveUser = async function(req, res) {
    try {
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log("--------------------------");

        const { firstName, lastName, email, phoneNumber, password, confirmPassword, priority, restaurant} = req.body;  
        const errors = validationSave(firstName, lastName, email, phoneNumber, password, confirmPassword, priority, restaurant);

        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/addPage", { errors, firstName, lastName, email });
        }

        let restaurantFound = await Restaurant.findOne({ name: restaurant}).exec();
        const errorValidate = await validateNewUser(email, phoneNumber, priority, restaurantFound);
        
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            return res.redirect(res.locals.previousPage);
        }

        // Encriptação da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        let perfil;

        if (restaurant) {
            perfil = new Perfil({
                phoneNumber: phoneNumber,
                email: email,
                password: hashedPassword,
                priority: priority,
                restaurantIds: restaurantFound._id,
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
        
        if(restaurant) {
            restaurantFound.countDono++;
            restaurantFound.perfil.ownersIds.push(newUser._id);
            await restaurantFound.save();
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
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log("-----------------------------------------------------------------------------------");

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

    /**
    const existingEmailRestaurant = await Restaurant.findOne({
        name: { $ne: restaurant },
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();
     */

    if (existingUser) {
        if (existingUser.perfil.email === email) {
            return "Já existe um utilizador com esse email!";
        } else {
            return "Já existe um utilizador com esse numero telefonico!";
        }
    }

    /*
    if (existingEmailRestaurant) {
        if (existingEmailRestaurant.perfil.email === email) {
            return "Já existe um restaurante com este email!";
        } else {
            return "Já existe um restaurante com esse numero telefonico!";
        }
    }
    */

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
 * Metodo para atualizar um user existente
 */
userController.updateUser =  async function(req, res) {
    try {
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log("-----------------------------------------------------------------------------------");
        console.log("Update");
        const { firstName, lastName, email, phoneNumber, priority, restaurant} = req.body;  

        //Validações aos campos
        let errors = await validationUpdate(firstName, lastName, email, phoneNumber, priority, restaurant);
        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
    
        let restaurantFound = await Restaurant.findOne({ name: restaurant}).exec();
        let user = await User.findOne({ _id: req.params.userId }).exec();
 
        //Está aqui um problema
        let errorValidate = await validateUpdateUser(user, email, phoneNumber, priority, restaurantFound);
    
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            console.log("Error: ", errorValidate);
            return res.redirect(res.locals.previousPage);
        }

        if (restaurant) {
            let updateCountRest = false;

            if (user.perfil.priority !== "Dono" && priority === "Dono") {
                user.perfil.restaurantIds = [];
                updateCountRest= true;
            } else if (user.perfil.priority === "Dono" && priority === "Dono" && 
                    !user.perfil.restaurantIds.includes(restaurantFound._id)) {
                    updateCountRest = true;
            }

            //Atualizo o count do restaurante
            if (updateCountRest) {
                user.perfil.restaurantIds.push(restaurantFound._id);

                restaurantFound.perfil.ownersIds.push(user._id);
                await restaurantFound.save();
            }
        }

        if (user.perfil.priority === "Dono" && priority !== "Dono") {
            console.log("A prioridade foi alterada de dono para cliente")
            await Restaurant.updateMany(
                { _id: { $in: user.perfil.restaurantIds } },
                { $pull: { 'perfil.ownersIds': user._id } }
            ).exec();

            //Forma que encontrei para dar delete no campo
            user.perfil.restaurantIds = undefined;
        }  
        
        //update
        user.firstName = firstName;
        user.lastName = lastName;
        user.perfil.email = email;
        user.perfil.phoneNumber = phoneNumber;
        user.perfil.priority = priority;
        
        //guardar as alterações
        user.save()
            .then(() => {
                console.log("User atualizado com sucesso!");
                res.redirect("/perfil/admin/listUsers");
            })
            .catch(error => {
                console.log("Erro:", error);
                res.redirect(`/perfil/admin/listUsers/editUser/${req.params.userId}`);
            })
    } catch(err) {
        console.log(err);
        res.redirect(res.locals.previousPage);
    }    
}

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
//Falta caso o user tenha uma imagem dar delete dela
userController.deleteUser = async function(req, res) {
    try {
        const user = await User.findOne({ _id: req.params.userId }).exec();

        if(user) {
            let imagePath = user.perfil.perfilPhoto;
            
            await user.deleteOne();
            console.log("User eliminado com sucesso!");

            if(imagePath !== "") {
                deleteImg(imagePath);
            }
            res.redirect("/perfil/admin/listUsers");
        }

      } catch (error) {
        console.log("Erro ao eliminar o user: ", error);
        res.redirect("/perfil/admin/listUsers");
      }
}

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