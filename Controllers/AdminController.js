var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../Models/Perfils/User");
const Restaurant = require("../Models/Perfils/Restaurant");

//Controllers

const { deleteImage} = require("./Functions/crudImagesRest");
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

async function validateUser(user, email, phoneNumber) {
    const existingUser = await User.findOne({
        _id: { $ne: user._id },
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

    if (existingUser || existingEmailRestaurant) {
        if (existingUser.perfil.email === email || existingEmailRestaurant.perfil.email === email) {
            return "Já existe uma conta com este email!";
        } else {
            return "Já existe uma conta com esse numero telefonico!";
        }
    }

    return "";
}

//O erro ocorre aqui
async function updateImage(req, res, admin) {
    return new Promise((resolve, reject) => {
        const storageupdatLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, "public/images/Users/Admin/");
            },
            filename: function (req, file, cb) {
                cb(null, `${file.originalname}`)
            }
        })
          
        const uploadUpdatePhoto = multer({ storage: storageupdatLogo }).single('perfilPhoto');

        uploadUpdatePhoto(req, res, function (err) {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    })
}
/*
Meter para ele editar também a sua foto de perfil aqui
*/
adminController.updateAdmin = async function(req, res) {
    try {
        let user = await User.findOne({_id: req.params.accountId}).exec();
        await updateImage(req, res, user);

        const { firstName, lastName, email, phoneNumber} = req.body;  

        //Validações aos campos
        const errors = await signUpController.validationUpdate(firstName, lastName, email, phoneNumber);

        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
       
        //Está aqui um problema
        const errorValidate = await validateUser(user, email, phoneNumber);
    
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

        let oldPhoto = user.perfil.perfilPhoto;
        let pathNewImg = req.file?.path || '';
        console.log("Nova Imagem: ", pathNewImg);
        
        if (pathNewImg !== '') {
            pathNewImg = "/" + pathNewImg.replace(/^public[\\/]/, "");
            user.perfil.perfilPhoto = pathNewImg;
        }

        //guardar as alterações
        user.save()
            .then(() => {
                console.log("User atualizado com sucesso!");
                if(user.perfil.perfilPhoto !== oldPhoto) {
                    console.log("Apagar imagem");
                    oldPhoto = "public" + oldPhoto;
                    deleteImage(oldPhoto);
                }
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