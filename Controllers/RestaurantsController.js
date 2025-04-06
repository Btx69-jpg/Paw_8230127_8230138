var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const pathR = require('path');

var Restaurant = require("../Models/Perfils/Restaurant");
var Address = require("../Models/Reusable/Address");
var Perfil = require("../Models/Reusable/Perfil");
var restaurantsController = {};

const totRestaurant = 15;
const crypto = require('crypto');
const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); 

//Utilizo o promisse pelo o metodo ser assincrono logo preciso do promisse, para fazer callbacks
function updateFile(oldFile, newFile) {
    try {
        fs.renameSync(oldFile, newFile);
        console.log('Pasta renomeada com sucesso!');
    } catch (err) {
        console.error('Erro ao renomear a pasta:', err);
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

function deleteImage(image) {
    console.log("Apagar Imagem");
    fs.unlink(image, (err) => {
        if (err) {
            console.error('Erro ao apagar a imagem:', err);
            return;
        }
        console.log('Antiga Imagem apagada com sucesso!');
    })
}

async function saveImage(req, res) {
    return new Promise((resolve, reject) => {
        const storageLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                const path = "public/images/Restaurants/" + req.body.name + "/";
                
                try {
                    fs.mkdirSync(path, { recursive: true });
                    console.log('Pasta criada com sucesso!');
                } catch (err) {
                    console.error('Erro ao criar a pasta:', err);
                }
                cb(null, path);
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });
          
        const uploadLogo = multer({ storage: storageLogo }).single('photoPerfil');
        
        // Executa o middleware do multer e aguarda sua finalização
        uploadLogo(req, res, function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }); 
}

/*
Meter promisses

Atualizar aqui o nome do package e depois se a imagem for nova, dar delete da atual e meter a nova
Não está a alterar o caminho
Tem erro ao apagar a imagem
*/
async function updateImage(req, res, restaurant) {
    return new Promise((resolve, reject) => {
        const storageupdatLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                let path = "public/images/Restaurants/" + restaurant.name + "/";
                let newPath = "";
                
                console.log();
                console.log();
                console.log();
                console.log();
                console.log("----------------------------------------------------------------");
                console.log(restaurant.name);
                console.log(req.body.name);
                
                if(restaurant.name !== req.body.name) {
                    newPath = "public/images/Restaurants/" + req.body.name + "/";
                    updateFile(path, newPath);
                } else {
                    newPath = path;
                }
                
                console.log(newPath);
                
                cb(null, newPath);
            },
            filename: function (req, file, cb) {
                cb(null, `${file.originalname}`)
            }
        })
          
        const uploadupdatLogo = multer({ storage: storageupdatLogo }).single('photoPerfil');
    
        uploadupdatLogo(req, res, function (err) {
            if (err) {
              return reject(err);
            }

            resolve();
        });
    })
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

//Armazena um novo restaurate
restaurantsController.saveRestaurant = async (req, res) => {
    try { 
        await saveImage(req, res);
        
        //Realização das verificações
        let validation = await validationRestaurant(req.body);
        if (validation !== "") {
            return res.status(500).send(validation);
        }

        //Ir buscar e guardar o caminho da imagem
        let pathImage = req.file?.path || '';
        const caminhoCorrigido = "/" + pathImage.replace(/^public[\\/]/, "");

        console.log(caminhoCorrigido);
        //Cryptografia da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        // Cria um novo restaurante com os dados fornecidos
        let restaurant = new Restaurant({
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
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId }).exec();
    try {
        //Upload da nova imagem se necessário
        await updateImage(req, res, restaurant);
        
        //Validações
        let validation = await validationEditRestaurant(req.body, restaurant);
        if (validation !== "") {
            return res.status(500).send(validation);
        } 

        //Altera a pasta e tem de alterar também o caminho para a logo
        let pathNewImg = req.file?.path || '';
        console.log(pathNewImg)
        let newImage = '';

        if(pathNewImg !== '') {
            newImage =  pathR.basename(pathNewImg);
        }

        let newFile = "";
        let pathImage = restaurant.perfil.photoPerfil;
        const fileName = pathR.basename(pathImage); //Saca a imagem do caminho
        console.log(filenName)
        /*
        O 1º if acontece quando se altera o nome mas não a imagem (nao funciona)
        O 2º if, quando se altera o nome e a imagem (nao funciona)
        O 3º if é quando se altera apenas a imagem (nao funciona)
        */
        if (restaurant.name !== req.body.name && pathNewImg === "") {
            newFile = "public/images/Restaurants/" + req.body.name + "/"
            updateFile(pathImage, newFile);
            newFile = newFile + fileName;
        } else if(restaurant.name !== req.body.name && fileName !== newImage) {
            newFile = "public/images/Restaurants/" + req.body.name + "/" + newImage;
            deleteImage(`public/images/Restaurants/${req.body.name}/${filename}`);
        } else if(restaurant.name === req.body.name && fileName !== newImage) {
            newFile = "public/images/Restaurants/" + restaurant.name + "/" + newImage;
            deleteImage(`public${pathImage}`);
        }

        await Restaurant.findByIdAndUpdate(req.params.restaurantId, { 
            $set: {
                name: req.body.name,
                'perfil.email': req.body.email,
                'perfil.phoneNumber': req.body.phoneNumber,
                'perfil.photoPerfil': newFile,
                sigla: req.body.sigla,
                nif: req.body.nif, 
                'address.street': req.body.street,
                'address.postal_code': req.body.postal_code,
                'address.city': req.body.city,
                description: req.body.description 
            },
        }, { new: true });
        
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
    //Em caso de erro voltar para a pagina de edit
   const restaurantId = req.params.restaurantId;
   const restaurant = await Restaurant.findOne({ _id: restaurantId }).exec();
    try {
        
        res.render('restaurants/crudRestaurantes/editPassword', {restaurant: restaurant });
    } catch (error) {
        console.log("Error", error);
        res.render("restaurants/crudRestaurantes/editRestaurant");
    }
};

async function validateNewPassowrd(body, restPass) {
    if(body.newPassword !== body.confirmNewPassword) {
        return "As novas password não coincidem";
    }
    
    //Cryptografia da password
    const salt = await bcrypt.genSalt(10);
    const hashedAtualPassword = await bcrypt.hash(restPass, salt);
    const hashedPassword = await bcrypt.hash(body.oldPassword, salt);
    const hashedNewPassword = await bcrypt.hash(body.newPassword, salt);

    let problem = "";

    if(hashedPassword !== hashedAtualPassword) {
        return "A passowd atual inserida está incorreta";
    } 

    if(hashedNewPassword === hashedAtualPassword) {
        return "A nova passwor é igual há antiga";
    }

    return problem;
}

restaurantsController.updatePassword = async (req, res) => {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId }).exec();
    try {
        
        let validation = await validateNewPassowrd(req.body, restaurant.perfil.password);

        if (validation !== "") {
            return res.status(500).send(validation);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(body.newPassword, salt);

        await Restaurant.findByIdAndUpdate(req.params.restaurantId, { 
            $set: {
                'perfil.password': hashedNewPassword,
            },
        }, { new: true });

        console.log("Password atualizada");
        res.redirect('restaurants/crudRestaurantes/editPassword', {restaurant: restaurant });
    } catch (error) {
        console.log("Error", error);
        res.redirect('restaurants/crudRestaurantes/editRestaurant', {restaurant: restaurant });
    }

}

/*
As pastas estão a voltar a não ser removidas
*/
restaurantsController.removeRestaurant = async (req, res) => {
    try {
        console.log(req.params.restaurant)
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