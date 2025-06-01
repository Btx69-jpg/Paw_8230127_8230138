var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../../Models/Perfils/User");
const Restaurant = require("../../Models/Perfils/Restaurant");

//Controllers
const signUpController = require("../SignUpController");

//Funções
const { deleteImage} = require("../Functions/crudImagesRest");

var adminController = {};

adminController.homePage = function(req, res) {
    res.render("perfil/admin/adminPage");
};


adminController.editPage = function(req, res) {
    res.render("perfil/admin/PagesAdmin/Users/editAdmin", {userD: res.locals.user});
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


async function updateImage(req, res) {
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

adminController.updateAdmin = async function(req, res) {
    const userId = req.params.accountId;
    try {
        let user = await User.findById(userId).exec();

        if (!user) {
            res.status(404).redirect(`/perfil/admin/editDados/${userId}`);
        }
        await updateImage(req, res);

        const { firstName, lastName, email, phoneNumber} = req.body;  

        //Validações aos campos
        const errors = await signUpController.validationUpdate(firstName, lastName, email, phoneNumber);

        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
       
        const errorValidate = await validateUser(user, email, phoneNumber);
    
        if (errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            console.log("Error: ", errorValidate);
            return res.redirect(res.locals.previousPage);
        }
        
        let updated = false;

        if (user.firstName !== firstName) {
            user.firstName = firstName;
            updated = true;
        }

        if (user.lastName !== lastName) {
            user.lastName = lastName;
            updated = true;
        }

        if (user.perfil.email !== email) {
            user.perfil.email = email;
            updated = true;
        }

        if (user.perfil.phoneNumber !== phoneNumber) {
            user.perfil.phoneNumber = phoneNumber;
            updated = true;
        }

        let oldPhoto = user.perfil.perfilPhoto;
        let pathNewImg = req.file?.path || '';
        
        if (pathNewImg !== '' && oldPhoto !== pathNewImg) {
            pathNewImg = "/" + pathNewImg.replace(/^public[\\/]/, "");
            user.perfil.perfilPhoto = pathNewImg;
            updated = true;
        }

        if(!updated) {
            console.log("")
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors: "Não foi alterado nenhum campo", firstName, lastName, email });
        }

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
                res.status(500).redirect(`/perfil/admin/editDados/${userId}`);
            })
    } catch(err) {
        console.log(err);
        res.status(500).redirect(res.locals.previousPage);
    }    
}

module.exports = adminController;