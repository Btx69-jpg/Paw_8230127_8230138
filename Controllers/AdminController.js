var mongoose = require("mongoose");

//Models
const User = require("../Models/Perfils/User");
const Restaurant = require("../Models/Perfils/Restaurant")
//Controllers
const signUpController = require("./SignUpController");
var adminController = {};

adminController.homePage = function(req, res) {
    res.render("perfil/admin/adminPage");
};


adminController.editPage = function(req, res) {
    res.render("perfil/admin/PagesAdmin/Users/editAdmin", {userD: res.locals.user});
};

//Se calhar antes do delete se tudo estiver vem o melhor é dar o logout
adminController.deleteAdm = async function(req, res) {
    User.deleteOne( {_id: req.params.adminId}).exec()
        .then(user => {
            console.log("User eliminado com sucesso");
            res.redirect("/");
        }) 
        .catch(error => {
            console.log("Erro :", error);
            res.redirect(res.locals.previousPage);
        })
};


async function validateEmailUser(user, email, phoneNumber) {
    const existingUser = await User.findOne({
        _id: { $ne: user._id },
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();

    const existingEmailRestaurant = await Restaurant.findOne({
        _id: { $ne: user._id },
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();

    if (existingUser || existingEmailRestaurant) {
        if (existingUser.perfil.email === email || existingEmailRestaurant.perfil.email === email) {
            return "Já existe uma conta com este email!";
        } else {
            return "Já existe uma conta com esse numero telefonico!";
        }
    }

    return "";
}

/*
Meter para ele editar também a sua foto de perfil aqui
*/
adminController.updateAdmin = async function(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber} = req.body;  

        //Validações aos campos
        const errors = await signUpController.validationUpdate(firstName, lastName, email, phoneNumber);

        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
    
        //Encontrar o user a atualizar
        let user = await User.findOne({ _id: req.params.adminId }).exec();
       
        //Está aqui um problema
        const errorValidate = await validateEmailUser(user, email, phoneNumber);
    
        if (errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            console.log("Error: ", errorValidate);
            return res.redirect(res.locals.previousPage);
        }
        
        //update
        user.firstName = firstName;
        user.lastName = lastName;
        user.perfil.email = email;
        user.perfil.phoneNumber = phoneNumber;
        
        //guardar as alterações
        user.save()
            .then(() => {
                console.log("User atualizado com sucesso!");
                res.redirect("/perfil/admin");
            })
            .catch(error => {
                console.log("Erro:", error);
                res.redirect(`/perfil/admin/editDados/${req.params.userId}`);
            })
    } catch(err) {
        console.log(err);
        res.redirect(res.locals.previousPage);
    }    
}

module.exports = adminController;