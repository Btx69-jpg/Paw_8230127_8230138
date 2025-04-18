var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Models
var Restaurant = require("../Models/Perfils/Restaurant");
var User = require("../Models/Perfils/User");
var passwordController = {};


passwordController.editPassword = async function(req, res) {
    try {
        const priority = req.cookies.priority;
        let account = null;
    
        if(priority === "Restaurant") {
            account = await Restaurant.findOne({ _id: req.params.accountId }).exec();
        } else {
            account = await User.findOne({ _id: req.params.accountId }).exec();
        }

        res.render('login/editPassword', {account: account, priority: priority});
    } catch(error) {
        console.log("Error", error);
        res.redirect(res.locals.previousPage);
    }
};

async function validateNewPassowrd(body, restPassword) {
    if(body.newPassword !== body.confirmNewPassword) {
        return "As novas password não coincidem";
    }

    let problem = "";

    if(!(await bcrypt.compare(body.atualPassword, restPassword))) {
        return "A passowd atual inserida está incorreta";
    } 

    if(await bcrypt.compare(body.newPassword, restPassword)) {
        return "A nova password é igual há antiga";
    }

    return problem;
}

passwordController.updatePassword = async (req, res) => {
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
    console.log("------------------------");
    console.log("Update Password");
    const priority = req.cookies.priority;

    try {
        let account = null;

        if(priority === "Restaurant") {
            account = await Restaurant.findOne({ _id: req.params.accountId }).exec();
        } else {
            account = await User.findOne({ _id: req.params.accountId }).exec();
        }
        
        let validation = await validateNewPassowrd(req.body, restaurant.perfil.password);

        if (validation !== "") {
            return res.render('errors/error500', {error: validation});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

        account.perfil.password = hashedNewPassword;

        console.log("Password atualizada com sucesso");
        
        if(priority === "Restaurant") {
            res.redirect(`/restaurants/editRestaurant/${req.params.accountId}`);
        } else if (priority === "Admin") {
            res.redirect(`/perfil/admin`);
        }
    } catch (error) {
        console.log("Error", error);
        
        if(priority === "Restaurant") {
            res.redirect(`/restaurants/editRestaurant/editPassword${req.params.accountId}`);
        } else if (priority === "Admin") {
            res.redirect(`/perfil/admin/editPassword/${req.params.accountId}`);
        }
    }
}

module.exports = passwordController;