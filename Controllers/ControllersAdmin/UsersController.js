var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Models
const User = require("../../Models/Perfils/User");
const Perfil = require("../../Models/Reusable/Perfil");
const Restaurantes = require("../../Models/Perfils/Restaurant");

//Constrollers
const signUpController = require("../SignUpController");
const Restaurant = require("../../Models/Perfils/Restaurant");
var userController = {};

//Associar um dono ao seu restaurante, atraves do id do restaurante

userController.homePage = async function(req, res) {
    User.find({ 'perfil.priority': { $ne: "Admin" }}).exec()
        .then(function(users) {
            res.render("perfil/admin/PagesAdmin/Users/listUsers", {users: users});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.render('errors/error500', {error: "Problema a procurar pelos Users"});
        });
};

userController.createUser = async function(req, res) {
    res.render("perfil/admin/PagesAdmin/Users/addUser");
}

userController.findOneRestaurante = async function(email, phoneNumber) {
    try {
        return await Restaurantes.findOne({ 'perfil.email': email, 'perfil.phoneNumber': phoneNumber });
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function validateNewUser(email, phoneNumber, priority) {
    const existingUser = await signUpController.findOneEmail(email);
    const existingEmailRestaurant = await signUpController.findOneEmailRestaurante(email);
    
    if (existingUser || existingEmailRestaurant && priority !== "Dono") {
        return "Já existe uma conta com este email!"
    }

    if (priority === "Dono") {
        const existingRestaurant = await userController.findOneRestaurante(email, phoneNumber);

        if (!existingRestaurant) {
            return "Não existe nenhum restaurante com esse email e numero de telefone!"
        }
    } 
    return "";
}

async function validateUpdateUser(user, email, phoneNumber, priority) {
    if(priority === 'Dono') {
        const existingRestaurant = await userController.findOneRestaurante(email, phoneNumber);

        if(!existingRestaurant) {
            return "Não existe nenhum restaurante com esse email e numero de telefone!";
        } 
    }

    //O problema não está no _id, é igual ao da DB
    const existingUser = await User.findOne({
        _id: { $ne: user._id },
        'perfil.email': email,
    }).exec();

    const existingEmailRestaurant = await Restaurant.findOne({
        _id: { $ne: user._id },
        'perfil.email': email || user.perfil.email,
    }).exec();

    //Ver bem esta validação, ela é capza de dar dores de cabeça futuras
    //Reitrei isto: " && user.perfil.priority !== "Dono" || priority !== "Dono""
    if (existingUser || existingEmailRestaurant) {
        return "Já existe uma conta com este email!"
    }

    return "";
}
/*
Testes:
Cria um user cliente corretamente (funciona)
Cria um admin corretamente (funciona)
Cria um dono corretamente (funciona)
Quando crio um dono e não meto o meail ou phoneNumber correto volta para tras?
Ver se caso haja erros, se é redirecionado de volta para o addPage (sim)

Erros: Por algum motivo quando
Entra aqui quando temos emails iguais mas por algum motivo não entra 
*/
userController.saveUser = async function(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword, priority} = req.body;  
        let errors = signUpController.validationSave(firstName, lastName, email, phoneNumber, password, confirmPassword);

        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/addPage", { errors, firstName, lastName, email });
        }

        let errorValidate = await validateNewUser(email, phoneNumber, priority);
        
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            return res.redirect(res.locals.previousPage);
        }

        // Encriptação da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const perfil = new Perfil({
            phoneNumber: phoneNumber,
            email: email,
            password: hashedPassword,
            priority: priority,
        });

        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            perfil: perfil,
            password: hashedPassword
        });

        await newUser.save();

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
            res.render("perfil/admin/PagesAdmin/Users/editUser", {userD: user});
        })
        .catch(error => {
            console.log("Erro: ", error);
            res.redirect("perfil/admin/listUsers");
        });
}

//Ver se o render funciona
//Já poso tirar o try catch
userController.updateUser =  async function(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber, priority} = req.body;  

        //Validações aos campos
        let errors = await signUpController.validationUpdate(firstName, lastName, email, phoneNumber);
        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
    
        //Encontrar o user a atualizar
        let user = await User.findOne({ _id: req.params.userId }).exec();
        console.log(user);
        //Está aqui um problema
        let errorValidate = await validateUpdateUser(user, email, phoneNumber, priority);
    
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            console.log("Error: ", errorValidate);
            return res.redirect(res.locals.previousPage);
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
                //userController.homePage(res, req);
            })
            .catch(error => {
                console.log("Erro:", error);
                req
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
            return res.render("/errors/error500", { error: erro });
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