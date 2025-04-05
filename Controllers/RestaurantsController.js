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

function renamePackage(oldPath, newPath) {
    try {
        fs.renameSync(oldPath, newPath);
        console.log('Pasta renomeada com sucesso!');
    } catch (err) {
        console.error('Erro ao renomear a pasta:', err);
    }
}

/*
async function renderEditsPage(page, restaurantId, redirectPage) {
    try {
        const restaurant = await Restaurant.findOne({ _id: restaurantId }).exec();
        res.render(page, { restaurant: restaurant });
    } catch (error) {
        console.log("Error", error);
        res.redirect(redirectPage);
    }
}
*/

async function validationRestaurant(body) {
    const restaurants = await Restaurant.find({}).exec();
    // Verifica se o limite de restaurantes foi atingido
    if (restaurants.length >= 15) {
        return "Não é possivel criar mais restaurantes";
    }

    if (body.name === undefined || body.nif === undefined || body.phoneNumber === undefined ||
        body.email === undefined || body.password === undefined || 
        body.confirmPassword === undefined || body.street === undefined ||
        body.postal_code === undefined || body.city === undefined) {
        return "Alguns dos campos obrigatórios não está preenchido";
    }

    if (body.password !== body.confirmPassword) { 
        return "As passwords não coincidem";
    }

    let find = false;
    let i = 0;
    let problem = "";

    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurants[i].name === body.name) {
            problem = "Já existe um restaurante com esse nome";
            find = true;
        } else if (restaurants[i].nif === body.nif) {
            problem = "Já existe um restaurante com esse NIF";
            find = true;
        } else if (restaurants[i].perfil.email === body.email) {
            problem = "Já existe um restaurante com esse email";
            find = true;
        } else if (restaurants[i].perfil.phoneNumber === body.phoneNumber) {
            problem = "Já existe um restaurante com esse numero telefonico";
            find = true;
        }
        i++;
    }

    return problem;
}

async function validationEditRestaurant(body) {
    const restaurants = await Restaurant.find({}).exec();

    if (body.name === undefined || body.nif === undefined || body.phoneNumber === undefined ||
        body.email === undefined || body.street === undefined || body.postal_code === undefined || 
        body.city === undefined) {
        return "Alguns dos campos obrigatórios não está preenchido";
    }

    let find = false;
    let i = 0;
    let problem = "";

    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurants[i].name === body.name) {
            problem = "Já existe um restaurante com esse nome";
            find = true;
        } else if (restaurants[i].nif === body.nif) {
            problem = "Já existe um restaurante com esse NIF";
            find = true;
        } else if (restaurants[i].perfil.email === body.email) {
            problem = "Já existe um restaurante com esse email";
            find = true;
        } else if (restaurants[i].perfil.phoneNumber === body.phoneNumber) {
            problem = "Já existe um restaurante com esse numero telefonico";
            find = true;
        }
        i++;
    }

    return problem;
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
        let validation = validationRestaurant(req.body);
        if (validation !== "") {
            return res.status(500).send(validation);
        }
        
        const path = "public/images/Restaurants/" + req.body.name + "/";
        createPackage(path);
        //await saveImage(path);

        //Se req.file existe retorna o req.file.path, se não retorna ''
        let pathImage = req.file?.path || '';

        //Cryptografia da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        // Cria um novo restaurante com os dados fornecidos
        let restaurant = new Restaurant({
            name: req.body.name,
            perfil: new Perfil({
                perfilPhoto: pathImage,
                email: req.body.email,
                password: hashedPassword,
                phoneNumber: req.body.phoneNumber,
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
        res.render('restaurants/crudRestaurantes/editRestaurant', { restaurant: restaurant });
    } catch (error) {
        console.log("Error", error);
        res.redirect("/restaurants");
    }
};

/*
Para alem de alterar o restaurant, também tenho de alterar o nome da pasta se necessário
E alterar o caminho da imagem, da logo, se necessario
*/
restaurantsController.updatRestaurant = async (req, res) => {
    try {
        // Validations
        console.log(req.body);
        let validation = validationEditRestaurant(req.body);
        if (validation !== "") {
            return res.status(500).send(validation);
        }

        let restaurant = await Restaurant.findOne({ name: req.body.name }).exec();
 
        //Altera a pasta e tem de alterar também o caminho para a logo
        if(restaurant.name != req.body.name) {
            const oldPath = "public/images/Restaurants/" + restaurant.name + "/";
            const newPath = "public/images/Restaurants/" + req.body.name + "/";
            renamePackage(oldPath, newPath);
            //ApgarImagem antiga, guardar a nova 
        } 

        //Quando guardar imagens, dar update a este if 
        //if(restaurant.name != req.body.name || restaurant.photoPerfil != req.body.photoPerfil) {
        //Quando a imagem é atualizada ou o nome do restaurante para dar update ou do package
        //Ou apenas da imagem ou do package + imagem
            //let pathImage = req.file?.path || '';
            //await updateImage(path);
            /*
                        await Restaurant.findByIdAndUpdate(req.params.id, { 
                $set: {
                    name: req.body.name,
                    'perfil.photoPerfil': req.body.perfilPhoto,
                    'perfil.email': req.body.email,
                    'perfil.phoneNumber': req.body.phoneNumber,
                    sigla: req.body.sigla,
                    nif: req.body.nif, 
                    'address.street': req.body.street,
                    'address.postal_code': req.body.postal_code,
                    'address.city': req.body.city,
                    description: req.body.description 
                },
              }, 
              { new: true });
            */
        //Como recebo também a foto, posso atualiza-la aqui também com a nova ou old
        console.log(restaurant);
        console.log("Cheguei aqui!!!!!!!!!")
        let newRest = await Restaurant.findByIdAndUpdate(req.params.id, { 
                $set: {
                    name: req.body.name,
                    'perfil.email': req.body.email,
                    'perfil.phoneNumber': req.body.phoneNumber,
                    'perfil.photoPerfil': '',
                    sigla: req.body.sigla,
                    nif: req.body.nif, 
                    'address.street': req.body.street,
                    'address.postal_code': req.body.postal_code,
                    'address.city': req.body.city,
                    description: req.body.description 
                },
              }, 
              { new: true });

              console.log(newRest)
        console.log("Restaurante atualizado com sucesso");
        res.redirect("/restaurants");
    } catch (error) {
        console.log("Error", error);
        res.render('restaurants/crudRestaurantes/editRestaurant', { restaurant: restaurant });
    }
};

/*employeeController.update = function(req, res) {
  Employee.findByIdAndUpdate(req.params.id, { 
    $set: {
      name: req.body.name,
      address: req.body.address,
      position: req.body.position,
      salary: req.body.salary 
    },
  }, { new: true },
  function(err, employee) {
    if(err) {
      console.log("Error: ", err);
      //Se deu erro voltamos ao edit
      res.render("employees/edit", {employee: req.body});
    } else {
      //Tenho de meter o /" + employee._id, para ir há pagian show do employee especifico
      res.redirect("/employees/show/" + employee._id);
    }
  })
}; */
restaurantsController.editPassword = async (req, res) => {
   const restaurantId = req.params.restaurantId
    try {
        const restaurant = await Restaurant.findOne({ _id: restaurantId }).exec();
        res.render('restaurants/crudRestaurantes/editPassword', {restaurant: restaurant });
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