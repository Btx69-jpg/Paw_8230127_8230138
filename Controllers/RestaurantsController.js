var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const pathR = require('path');

//Models
var Restaurant = require("../Models/Perfils/Restaurant");
var Address = require("../Models/Reusable/Address");
var Perfil = require("../Models/Reusable/Perfil");
var restaurantsController = {};

//Metodos
const { updatePackage, deletePackage } = require('./Functions/crudPackage');
const { deleteImage, saveImage, updateImage } = require("./Functions/crudImagesRest");
const { error } = require("console");
const User = require("../Models/Perfils/User");
const totRestaurant = 15; 

async function validationRestaurant(body) {
    const restaurants = await Restaurant.find({}).exec();
    // Verifica se o limite de restaurantes foi atingido
    if (restaurants.length >= totRestaurant) {
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

async function validationEditRestaurant(body, restaurant) {
    if (body.name === undefined || body.nif === undefined || body.phoneNumber === undefined ||
        body.email === undefined || body.street === undefined || body.postal_code === undefined || 
        body.city === undefined) {
        return "Alguns dos campos obrigatórios não está preenchido";
    }

    let find = false;
    let i = 0;
    let problem = "";
    const restaurants = await Restaurant.find({}).exec();

    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurant.name !== body.name && restaurants[i].name === body.name) {
            problem = "Já existe um restaurante com esse nome";
            find = true;
        } else if (restaurant.nif !== body.nif && restaurants[i].nif === body.nif) {
            problem = "Já existe um restaurante com esse NIF";
            find = true;
        } else if (restaurant.perfil.email !== body.email && restaurants[i].perfil.email === body.email) {
            problem = "Já existe um restaurante com esse email";
            find = true;
        } else if (restaurant.perfil.phoneNumber !== body.phoneNumber && restaurants[i].perfil.phoneNumber === body.phoneNumber) {
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
    Restaurant.find({ aprove: true}).exec()
        .then(function(restaurants) {
            res.render("restaurants/restaurants", {restaurants: restaurants});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.render("errors/error", {numError: 500, error: err});
        });
};

restaurantsController.createRestaurant = function(req, res) {
    let action = "";

    switch (res.locals.currentPage) {
        case "/restaurants": {
            action = "/restaurants/saveRestaurant";
            break;
        } case "/perfil/admin/listRestaurants": {
            action = "/perfil/admin/listRestaurants/saveRestaurant";
            break;
        } case "/registRestaurant": {
            action = "/registRestaurant/saveRestaurant"
            break;
        } default: {
            action = "";
            break;
        }
    }

    console.log("Ação:", action);
    res.render('restaurants/crudRestaurantes/addRestaurant', {action: action});
};

//Filtra por restaurantes (Reutilizar codigo também no admin)
restaurantsController.search = function(req, res) {
    let query = {};
    const restaurant = req.query.name;
    const city = req.query.city;
    query.aprove = true;
    
    if (restaurant) {
      query.name = { "$regex": restaurant, "$options": "i" };
    }
  
    if (city) {
        query["address.city"] = { "$regex": city, "$options": "i" };
    }
    
    Restaurant.find(query).exec()
      .then(function (restaurants) {
        res.render("restaurants/restaurants", {restaurants: restaurants});
      })
      .catch(function(err) {
        console.error("Erro ao filtrar pelos restuarantes: ", err);
        res.render("errors/error", {numError: 500, error: err});
      }); 
  };

//Armazena um novo restaurate
restaurantsController.saveRestaurant = async function(req, res) {
    try { 
        await saveImage(req, res);
        
        //Realização das verificações
        let validation = await validationRestaurant(req.body);
        
        if (validation !== "") {
            return res.render("errors/error", {numError: 500, error: validation});
        }

        //Ir buscar e guardar o caminho da imagem
        let pathImage = req.file?.path || '';
        const caminhoCorrigido = "/" + pathImage.replace(/^public[\\/]/, "");
        //Cryptografia da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        let aproved = false;
        const cookie = req.cookies.priority
        
        if (cookie === "Admin") {
            aproved = true;
        } 

        // Cria um novo restaurante com os dados fornecidos
        let restaurant = null;

        if(cookie === "Cliente") {
            console.log("Id do user: ", req.user.userId);
            restaurant = new Restaurant({
                name: req.body.name,
                perfil: new Perfil({
                    perfilPhoto: caminhoCorrigido,
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
                description: req.body.description,
                aprove: aproved,
                tempUserId: req.user.userId,
            });
        } else {
            restaurant = new Restaurant({
                name: req.body.name,
                perfil: new Perfil({
                    perfilPhoto: caminhoCorrigido,
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
                description: req.body.description,
                aprove: aproved,
            });
        }
        // Guarda o restaurante a bd
        await restaurant.save();

        console.log("Restaurante: ", restaurant)
        switch (res.locals.currentPage) {
            case "/restaurants/saveRestaurant": {
                res.redirect("/restaurants");
                break;
            } case "/perfil/admin/listRestaurants/saveRestaurant": {
                res.redirect("/perfil/admin/listRestaurants")
                break;
            } case "/registRestaurant/saveRestaurant": {
                res.redirect("/");
                break;
            }default: {
                console.log("Parou no break, logo não sei que pagina redirecionar");
                break;
            }
        }
    } catch (error) {
        console.log("Error", error);
        res.render(res.locals.previousPage);
    }
};

//Carrega a pagina para editar um restaurante (finalizado) 
restaurantsController.editRestaurant = (req, res) => {
    Restaurant.findOne({ _id: req.params.restaurantId }).exec()
        .then(restaurant => {
            res.render('restaurants/crudRestaurantes/editRestaurant', { restaurant: restaurant, priority: req.cookies.priority });
        })
        .catch(error => {
            console.log("Error", error);
            res.redirect(res.locals.previousPage);
        });
};

/*
Para alem de alterar o restaurant, também tenho de alterar o nome da pasta se necessário
E alterar o caminho da imagem, da logo, se necessario

Quando altero o nome do restaurante, já é alterado no mongoDb o caminho no não é alterado o nome da pasta
*/
restaurantsController.updatRestaurant = async (req, res) => {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId }).exec();
    try {
        //Upload da nova imagem se necessário
        await updateImage(req, res, restaurant);
        
        //Validações
        let validation = await validationEditRestaurant(req.body, restaurant);
        if (validation !== "") {
            return res.render("errors/error", {numError: 500, error: validation});
        } 

        //Altera a pasta e tem de alterar também o caminho para a logo
        //Dasdos da nova imagem
        let caminhoCorrigido = restaurant.perfil.perfilPhoto;
        let pathNewImg = req.file?.path || '';

        if (restaurant.name !== req.body.name || pathNewImg !== '') {
            let newImage = '';

            if (pathNewImg !== '') {
                newImage =  pathR.basename(pathNewImg);
            }
    
            //Dados da imagem guardada no mongoDb
            let newFile = "";
  
            const perfilPhoto = pathR.basename(caminhoCorrigido); //Saca a imagem do caminho
    
            /*
            O 1º if acontece quando não se altera a imagem 
            O 2º if, quando se altera a imagem 
            */
            if (pathNewImg === '' && restaurant.name !== req.body.name) {
                newFile = "public/images/Restaurants/" + req.body.named;
                let pathPerfilPhoto = "public/images/Restaurants/" + restaurant.name;
                await updatePackage(pathPerfilPhoto, newFile);
                newFile = newFile + "/" + perfilPhoto;
                caminhoCorrigido = "/" + newFile.replace(/^public[\\/]/, "");
            } else if (perfilPhoto !== newImage) {
                if (restaurant.name !== req.body.name) {
                    newFile = "public/images/Restaurants/" + req.body.name + "/" + newImage;
                } else {
                    newFile = "public/images/Restaurants/" + restaurant.name + "/" + newImage;
                }
    
                deleteImage(`public/images/Restaurants/${req.body.name}/${perfilPhoto}`);
                caminhoCorrigido = "/" + newFile.replace(/^public[\\/]/, "");
            }
        }

        await Restaurant.findByIdAndUpdate(req.params.restaurantId, { 
            $set: {
                name: req.body.name,
                'perfil.email': req.body.email,
                'perfil.phoneNumber': req.body.phoneNumber,
                'perfil.perfilPhoto': caminhoCorrigido,
                sigla: req.body.sigla,
                nif: req.body.nif, 
                'address.street': req.body.street,
                'address.postal_code': req.body.postal_code,
                'address.city': req.body.city,
                description: req.body.description 
            },
        }, { new: true });
        
        console.log("Restaurante atualizado com sucesso");
        if(res.locals.currentPage === `/restaurants/updatRestaurant/${req.params.restaurantId}`) {
            res.redirect("/restaurants");
        } else if(res.locals.currentPage === `/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`) {
            res.redirect("/perfil/admin/listRestaurants");
        }
    } catch (error) {
        console.log("Error", error);

        if (res.locals.currentPage === `/restaurants/updatRestaurant/${req.params.restaurantId}`) {
            res.redirect(`/restaurants/updatRestaurant/${req.params.restaurantId}`);
        } else if (res.locals.currentPage === `/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`) {
            res.redirect(`/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`);
        }
    }
};

/* Metodo para remover um restaurant */
restaurantsController.removeRestaurant = async (req, res) => {
    try {
        await Restaurant.deleteOne({ name: req.params.restaurant });
        deletePackage(`public/images/Restaurants/${req.params.restaurant}/`);
        console.log("Restaurante eliminado!");
        res.redirect(res.locals.previousPage);
    } catch (error) {
        console.log("Error", error);
        console.log("Problema a eliminar o restaurant")
        res.render("errors/error", {numError: 500, error: error});
    }
};

module.exports = restaurantsController;