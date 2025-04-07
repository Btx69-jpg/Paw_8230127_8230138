var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../Models/Perfils/User");
const Perfil = require("../Models/Reusable/Perfil");

var signUpController = {};

// Renderiza página de registo
signUpController.signup = (req, res) => {
    res.render("login/signUp");
};

// Verifica se o utilizador já existe
signUpController.findOne = async (email) => {
    return await User.findOne({ 'perfil.email': email });
};

// Salva um novo utilizador
signUpController.save = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body;
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

        //Valida se o user já existe
        const existingUser = await signUpController.findOne(email);
        if (existingUser) {
            req.flash("error_msg", "Já existe uma conta com este email!");
            return res.redirect("/signUp");
        }

        // Encriptação da password
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
            firstName: firstName,
            lastName: lastName,
            perfil: perfil,
            password: hashedPassword
        });

        await newUser.save();

        req.flash("success_msg", "Registo realizado com sucesso!");
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Erro ao criar o utilizador. Tente novamente.");
        res.redirect("/signUp");
    }
};

module.exports = signUpController;