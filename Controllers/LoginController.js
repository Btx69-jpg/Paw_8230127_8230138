const mongoose = require("mongoose");
const User = require("../Models/Perfils/User");
const bcrypt = require("bcryptjs");
var AddressOrder = require("../Models/Reusable/AddressOrder");
var Perfil = require("../Models/Reusable/Perfil")

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
    return await User.findOne({ email: email });
};

// Salva um novo usuário
userController.save = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        let errors = [];

        // Validações
        if (!firstName || !lastName || !email || !password) {
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

        // Criação do usuário
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criação do perfil
        const perfil = new Perfil({
            email: email,
            password: hashedPassword,
            priority: rolemap["Cliente"]

        });

        const newUser = new User({
            firstName,
            lastName,
            perfil: perfil,
            email,
            password: hashedPassword
        });

        await newUser.save();

        req.flash("success_msg", "Registo realizado com sucesso!");
        res.redirect("/login/login");

    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Erro ao criar o utilizador. Tente novamente.");
        res.redirect("/login/signUp");
    }
};

module.exports = userController;
