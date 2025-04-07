const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require('passport');

const User = require("../Models/Perfils/User");
const AddressOrder = require("../Models/Reusable/AddressOrder");
const Perfil = require("../Models/Reusable/Perfil");


const userController = {};

// Renderiza página de login
userController.login = (req, res) => {
    res.render("login/login");
};

// Renderiza página de registo
userController.signup = (req, res) => {
    res.render("login/signUp");
};

// Verifica se o utilizador já existe
userController.findOne = async (email) => {
    return await User.findOne({ 'perfil.email': email });
};

// Salva um novo usuário
userController.save = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword ,cart} = req.body;
        let errors = [];

        // Validações
        if (!firstName || !lastName || !email || !password || !phoneNumber) {
            errors.push({ texto: "Todos os campos são obrigatórios!" });
        }
        if (password.length < 8) {
            errors.push({ texto: "A senha deve ter pelo menos 8 caracteres!" });
        }
        if (password !== confirmPassword) {
            errors.push({ texto: "As senhas não coincidem!" });
        }

        if (errors.length > 0) {
            return res.render("login/signUp", { errors, firstName, lastName, email });
        }

        const existingUser = await userController.findOne(email);
        if (existingUser) {
            req.flash("error_msg", "Já existe uma conta com este email!");
            return res.redirect("/login/signUp");
        }

        // Criação do utilizador
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criação do perfil
        const perfil = new Perfil({
            phoneNumber: phoneNumber,
            email: email,
            password: hashedPassword,
            priority: "Cliente",
        });

        const newUser = new User({
            firstName,
            lastName,
            perfil: perfil,
            password: hashedPassword
        });
        console.log(newUser);

        await newUser.save();

        req.flash("success_msg", "Registo realizado com sucesso!");
        res.redirect("/login/login");

    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Erro ao criar o utilizador. Tente novamente.");
        res.redirect("/login/signUp");
    }
};

// Autentica o utilizador
userController.authenticate = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login/login",
        failureFlash: true,
    })(req, res, next);
};

module.exports = userController;
