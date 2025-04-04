var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const fs = require('fs');
const multer = require('multer');

var Restaurant = require("../Models/Perfils/Restaurant");
var Address = require("../Models/Reusable/Address");
var Perfil = require("../Models/Reusable/Perfil");
var restaurantsController = {};

const totRestaurant = 15;
const crypto = require('crypto');
const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); 

async function saveImage(path) {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `public/${path}/`)
        },
        filename: function (req, file, cb) {
            cb(null, `${file.originalname}`)
        }
    })

    multer({ storage: storage });
}

function createPackage(path) {
    try {
        fs.mkdirSync(path, { recursive: true });
        console.log('Pasta criada com sucesso!');
    } catch (err) {
        console.error('Erro ao criar a pasta:', err);
    }
}

function deletepackage(path) {
    try {
        fs.rmSync(path, { recursive: true, force: true });
        console.log('Pasta apagada com sucesso!');
    } catch (err) {
        console.error('Erro ao apagar a pasta:', err);
    }
}

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Retornando o IV junto com o texto criptografado, separados por um delimitador (por exemplo, ':')
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText, keyDecrypted) {
    // Separando o IV do texto criptografado
    const textParts = encryptedText.split(':');
    const ivFromText = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyDecrypted, ivFromText);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo
//Preciso de no render mandar também os employees
restaurantsController.restaurantsPage = function(req, res) {
    Restaurant.find({}).exec()
        .then(function(restaurants) {
            res.render("restaurants/restaurants", {restaurants: restaurants});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).send("Problema a procurar pelos pratos do menu");
        });
};

restaurantsController.createRestaurant = function(req, res) {
    res.render('restaurants/crudRestaurantes/addRestaurant');
};

/*
Falta adicionar a foto do restaurante!!!!
*/
//Meter verificação para não deixar adicionar mais que 15 restaurantes
restaurantsController.saveRestaurant = async (req, res) => {
    try {
        // Obtém todos os restaurantes
        console.log(req.body)
        const restaurants = await Restaurant.find({}).exec();

        // Verifica se o limite de restaurantes foi atingido
        if (restaurants.length >= 15) {
            return res.status(500).send("Não é possivel criar mais restaurantes");
        }

        if (req.body.password !== req.body.confirmPassword) { 
            return res.status(500).send("As passwords não coincidem");
        }

        let find = false;
        let i = 0;
        let problem = "";

        // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
        while (i < restaurants.length && !find) {
            if (restaurants[i].name === req.body.name) {
                problem = "Já existe um restaurante com esse nome";
                find = true;
            } else if (restaurants[i].nif === req.body.nif) {
                problem = "Já existe um restaurante com esse NIF";
                find = true;
            } else if (restaurants[i].perfil.email === req.body.email) {
                problem = "Já existe um restaurante com esse email";
                find = true;
            } else if (restaurants[i].perfil.phoneNumber === req.body.phoneNumber) {
                problem = "Já existe um restaurante com esse numero telefonico";
                find = true;
            }
            i++;
        }

        if (find) {
            return res.status(500).send(problem);
        }

        
        const path = "public/images/Restaurants/" + req.body.name + "/";
        createPackage(path);
        //await saveImage(path);

        //Se req.file existe retorna o req.file.path, se não retorna ''
        let pathImage = req.file?.path || '';

        // Cria um novo restaurante com os dados fornecidos
        let restaurant = new Restaurant({
            name: req.body.name,
            perfil: new Perfil({
                perfilPhoto: pathImage,
                email: req.body.email,
                password: encrypt(req.body.password),
                keyDecrypted: key.toString('hex'), //Guarda a chave no formato hexadecimal, que é o correto para este caso
                phoneNumber: req.body.phoneNumber,
                countOrders: 0,
                historicOrders: [],
                priority: "Restaurant",
            }),
            sigla: req.body.sigla,
            nif: req.body.nif, 
            address: new Address({
                street: req.body.street,
                postal_code: req.body.postal_code,
                city: req.body.city
            }),
            description: req.body.description
        });

        // Guarda o restaurante a bd
        await restaurant.save();

        console.log("Restaurante guardado com sucesso");
        res.redirect("/restaurants");
    } catch (error) {
        console.log("Error", error);
        res.render("restaurants/crudRestaurantes/addRestaurant");
    }
};

restaurantsController.editRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId }).exec();
        //Mando o restaurant e a password desencriptada
        //O Buffer.from(restaurant.perfil.keyDecrypted, 'hex'), converte a chave de string para buffer
        res.render('restaurants/crudRestaurantes/editRestaurant', {
            restaurant: restaurant,
            password: decrypt(restaurant.perfil.password, Buffer.from(restaurant.perfil.keyDecrypted, 'hex')),
        });
    } catch (error) {
        console.log("Error", error);
        res.redirect("/restaurants");
    }
};


restaurantsController.removeRestaurant = async (req, res) => {
    try {
        await Restaurant.deleteOne({ name: req.params.restaurant });
        deletepackage(`public/images/Restaurants/${req.params.restaurant}/`);
        console.log("Restaurante eliminado!");
        res.redirect("/restaurants");
    } catch (error) {
        console.log("Error", error);
        res.status(500).send("Problema a apagar o restaurante");
    }
};
/*Meter codigo, para adicionar, editar e apagar */

module.exports = restaurantsController;