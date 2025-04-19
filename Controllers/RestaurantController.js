var mongoose = require("mongoose");
const multer  = require('multer');

const Restaurant = require("../Models/Perfils/Restaurant");
const Dish = require("../Models/Menus/Dish");
const Category = require("../Models/Reusable/Category");
const Menu = require("../Models/Menus/Menu");
const Portion = require("../Models/Reusable/Portion");
const Order = require("../Models/Orders/Order");
const Address = require("../Models/Reusable/Address");
const AddressOrder = require("../Models/Reusable/AddressOrder");
const { format } = require("morgan");
const fs = require('fs'); // Certifique-se de importar o fs se ainda não estiver


var restaurantController = {};

//Depois quando os restuarant e menu estiverem todos vem, modeificar os links todos

/*Funçõers responsaveis por carregar todas as categorias de pratos e renderizar no createDish e no editDish */
async function carregarCategories() {
    let categories = []
    try {
        categories = await Category.find({}).exec();
    } catch (err) {
        console.error(err);
        categories = null;
    }
    return categories;
}

async function carregarPortions() {
    let portions = [];
    try {
        portions = await Portion.find({}).exec();
    } catch (err) {
        console.error(err);
        portions = null;
    }
    return portions;
}

async function renderCreateDish(res) {
    let categories = await carregarCategories();
    let portions = await carregarPortions();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/createDish", {categories: categorie, portions: portions});
    } else {
        res.render("errors/error500", {error: "Problema a procurar as categorias dos pratos"});
    }
}

//Testar
async function renderEditDish(res, dish) {
    let categories = await carregarCategories();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/editDish", {dish: dish}, {categories: categories});
    } else {
        res.render("errors/error500", {error: "Problema a procurar os pratos"});
    }
}

restaurantController.homePage = async function(req, res) {
    //Copiar o veiw da ficha6, para mostar apenas 1 restaurante e mandar no render
    //Depois meter res.redirect("/employees/show/" + employee._id);
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        let categories = await carregarCategories();
        res.render("restaurants/restaurant/homepage", { restaurant: restaurant, categories: categories });
    } catch (err) {
        res.render("errors/error500", {error: err});
    }
};

//Permite visualizar um menu especifico de um restaurante
restaurantController.comments = function(req, res) {
    res.render("restaurants/restaurant/comments");
};

// GET /restaurants/:restaurant/orderManagement
restaurantController.orderManagement = async function(req, res) {
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
      .populate('orders.client orders.addressOrder')
      .exec();
  
    // Separa por status
    const pendentes = restaurant.orders.filter(o => o.status === 'Pendente');
    const expedidas = restaurant.orders.filter(o => o.status === 'Expedida');
    const entregues = restaurant.orders.filter(o => o.status === 'Entregue');
  
    res.render("restaurants/restaurant/orderManagement", {
      restaurant,pendentes, expedidas, entregues
    });
  };
  
 // GET /:restaurant/orders
restaurantController.getOrders = async function(req, res) {
    try {
      const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
      return res.json(restaurant.orders);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
  
  // POST /:restaurant/orders
restaurantController.createOrder = async function(req, res) {
    try {
        const { client, addressOrder, itens, totEncomenda } = req.body;
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();

        const newOrder = {
            client,
            addressOrder,
            itens,       
            totEncomenda,
            status: 'Pendente'
        };

        restaurant.orders.push(newOrder);
        await restaurant.save();
        // devolve a encomenda com o _id atribuído pelo Mongo
        const created = restaurant.orders[ restaurant.orders.length - 1 ];
        return res.status(201).json(created);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
  
  // PUT /:restaurant/orders/:orderId/status
restaurantController.updateOrderStatus = async function(req, res) {
    try {
        const { status } = req.body;
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const order = restaurant.orders.id(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Encomenda não encontrada' }); 
        }

        order.status = status;
        await restaurant.save();
        return res.json(order);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
  

// Permite visualizar um menu específico de um restaurante
restaurantController.showMenu = async function (req, res) {
    try {
      // Realiza a consulta e popula o caminho aninhado: menus.dishes.portions.portion
      const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
        .populate({
          path: "menus.dishes.portions.portion",
          model: "Portion"
        })
        .exec();
  
      // Extrai o menu específico a partir do array de menus
      const menu = restaurant.menus.id(req.params.menu);
      if (!menu) {
        return res
          .status(404)
          .render("errors/error404", { error: "Menu não encontrado" });
      }
  
      res.render("restaurants/restaurant/Menu/menu", { restaurant: restaurant, menu: menu });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/error", { error: "Erro ao recuperar o menu" });
    }
  };

restaurantController.getMenus = async function(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
      .populate({
        path: 'menus.dishes'
      })
      .exec();
    const menus = restaurant.menus.map(menu => ({
      _id: menu._id,
      name: menu.name,
      dishes: menu.dishes.map(d => ({ _id: d._id, name: d.name, price: d.price }))
    }));
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  
  

//Permite criar um novo menu no restaurante
restaurantController.createMenu = async function (req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const categories = await carregarCategories();
        const portions = await carregarPortions();

        res.render("restaurants/restaurant/Menu/createMenu", { restaurant: restaurant, categories: categories, portions: portions });
    } catch (err) {
        res.render("errors/error500", {error: err});
    }
};

restaurantController.saveMenu = async function(req, res) {
    try {
        await saveImage(req, res);

        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        if (!restaurant) {
            return res.status(404).send("Restaurante não encontrado");
        }

        // Obter a foto do menu
        const menuPhotoFile = req.files.find(file => file.fieldname === 'menuPhoto');
        const menuPhotoPath = menuPhotoFile ? "/" + menuPhotoFile.path.replace(/^public[\\/]/, "") : null;

        // Mapeia os arquivos pelos índices dos pratos
        const fileMap = {};
        req.files.forEach(file => {
            const match = file.fieldname.match(/dishes\[(\d+)\]\[photo\]/);
            if (match) {
                const index = parseInt(match[1], 10);
                fileMap[index] = file;
            }
        });

        let dishes = req.body.dishes;
        if (!dishes) {
            return res.status(400).send("Nenhum prato foi enviado");
        }

        if (!Array.isArray(dishes)) {
            dishes = [dishes];
        }

        let dishObjects = [];
        for (let i = 0; i < dishes.length; i++) {
            const dishData = dishes[i];
            const file = fileMap[i];

            // Validação de porções
            const portions = [];

            if (dishData.portions.length === 0) {
                return res.status(400).render("restaurants/restaurant/Menu/createMenu", { 
                    restaurant, 
                    categories: await carregarCategories(), 
                    portions: await carregarPortions(),
                    error: `Pelo menos uma porção é obrigatória para o prato ${i + 1}`
                });
            }

            if (dishData.portions) {
                const portionPrices = Array.isArray(dishData.portionPrices) ? dishData.portionPrices : [dishData.portionPrices];


                
                dishData.portions.forEach((portionId, idx) => {
                    if (!portionPrices[idx] || isNaN(portionPrices[idx])) {
                        throw new Error(`Preço obrigatório para a porção selecionada no prato ${i + 1}`);
                    }
                    portions.push({
                        portion: portionId,
                        price: parseFloat(portionPrices[idx])
                    });
                });
            }

            if (!file) {
                return res.status(400).render("restaurants/restaurant/Menu/createMenu", { 
                    restaurant, 
                    categories: await carregarCategories(), 
                    error: `Imagem não encontrada para o prato ${i + 1}.`
                });
            }

            // Verifica duplicatas
            for (let j = i + 1; j < dishes.length; j++) {
                if (dishData.name === dishes[j].name) {
                    return res.status(400).render("restaurants/restaurant/Menu/createMenu", { 
                        restaurant, 
                        categories: await carregarCategories(), 
                        error: "Nomes duplicados não são permitidos."
                    });
                }
            }

            const caminhoCorrigido = "/" + file.path.replace(/^public[\\/]/, "");

            dishObjects.push(new Dish({
                name: dishData.name,
                description: dishData.description,
                category: dishData.category,
                price: dishData.price,
                portions: portions,
                photo: caminhoCorrigido
            }));
        }

        const menu = new Menu({
            name: req.body.name,
            type: req.body.type,
            dishes: dishObjects,
            photo: menuPhotoPath
        });

        restaurant.menus.push(menu);
        await restaurant.save();

        res.redirect("/restaurants/" + restaurant.name);
    } catch (err) {
        console.error(err);
        res.render("errors/error500", { error: err.message });
    }
};

// Renderiza a página de edição do menu
restaurantController.editMenu = async function(req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const menu = restaurant.menus.id(req.params.menuId);
        const categories = await carregarCategories();
        let portions = await carregarPortions();

        if (!menu) {
            return res.status(404).render("errors/error404", { error: "Menu não encontrado" });
        }

        res.render("restaurants/restaurant/Menu/editMenu", {
            restaurant: restaurant,
            menu: menu,
            categories: categories,
            portions: portions,
        });
    } catch (err) {
        res.render("errors/error500", { error: err });
    }
};

// Atualiza o menu no banco de dados
restaurantController.saveEditMenu = async function(req, res) {
    try {
        await saveImage(req, res);
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const menu = restaurant.menus.id(req.params.menuId);
        const portions = await Portion.find({}).exec();

        // Atualiza dados básicos do menu
        menu.name = req.body.name;
        menu.type = req.body.type;

        const menuPhotoFile = req.files.find(file => file.fieldname === 'menuPhoto');
        if (menuPhotoFile) {
            // Apagar imagem antiga se existir
            if (menu.photo && fs.existsSync("public" + menu.photo)) {
                fs.unlinkSync("public" + menu.photo);
            }
            menu.photo = "/" + menuPhotoFile.path.replace(/^public[\\/]/, "");
        }

        // Atualiza pratos existentes
        if (req.files) {
            // Mapear arquivos para pratos existentes
            const existingDishesFiles = {};
            req.files.forEach(file => {
                const match = file.fieldname.match(/dishes\[(\d+)\]\[photo\]/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    existingDishesFiles[index] = file;
                }
            });
        
            req.body.dishes.forEach((dishData, index) => {
                const existingDish = menu.dishes.id(dishData._id);
                if (existingDish) {
                    
                    existingDish.name = dishData.name;
                    existingDish.description = dishData.description;
                    existingDish.category = dishData.category;
                    existingDish.price = dishData.price;

                    const portionsData = [];
                    if (dishData.portions) {
                        const prices = Array.isArray(dishData.portionPrices) ? 
                            dishData.portionPrices : 
                            [dishData.portionPrices];

                        dishData.portions.forEach((portionId, idx) => {
                            if (!prices[idx] || isNaN(prices[idx])) {
                                throw new Error(`Preço obrigatório para porção no prato ${existingDish.name}`);
                            }
                            portionsData.push({
                                portion: portionId,
                                price: parseFloat(prices[idx])
                            });
                        });
                    }
                    existingDish.portions = portionsData;
                

        
                    // Atualizar imagem se houver arquivo para este índice
                    if (existingDishesFiles[index]) {
                        // Apagar imagem antiga
                        if (fs.existsSync("public" + existingDish.photo)) {
                            fs.unlinkSync("public" + existingDish.photo);
                        }
                        existingDish.photo = "/" + existingDishesFiles[index].path.replace(/^public[\\/]/, "");
                    }
                }
            });
        }

 // Atualiza o tratamento de novos pratos
if (req.body.newDishes) {
    // Cria um mapa das novas imagens
    const newDishesFiles = {};
    req.files.forEach(file => {
        const match = file.fieldname.match(/newDishes\[(\d+)\]\[photo\]/);
        if (match) {
            const index = parseInt(match[1], 10);
            newDishesFiles[index] = file;
        }
    });

    Object.keys(req.body.newDishes).forEach(index => {
        const newDish = req.body.newDishes[index];
        const file = newDishesFiles[index];

        if (!file) {
            return res.status(400).render("errors/error400", {
                error: `Imagem obrigatória para o novo prato ${parseInt(index) + 1}`
            });
        }

        menu.dishes.push(new Dish({
            name: newDish.name,
            description: newDish.description,
            category: newDish.category,
            price: newDish.price,
            photo: "/" + file.path.replace(/^public[\\/]/, "")
        }));
    });
    }

    const deletedDishes = Array.isArray(req.body.deletedDishes) 
    ? req.body.deletedDishes 
    : [req.body.deletedDishes].filter(Boolean);

if (deletedDishes.length > 0) {
    deletedDishes.forEach(dishId => {
        const dishToRemove = menu.dishes.id(dishId);
        if (dishToRemove) {
            if (fs.existsSync("public" + dishToRemove.photo)) {
                fs.unlinkSync("public" + dishToRemove.photo);
            }
            menu.dishes.remove(dishToRemove);
        }
    });
}

        await restaurant.save();
        res.redirect(`/restaurants/${restaurant.name}/showMenu/${menu._id}`);
    } catch (err) {
        res.render("errors/error500", { error: err });
    }
};

restaurantController.deleteMenu = async function(req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const menu = restaurant.menus.id(req.params.menuId);

        if (!menu) {
            return res.status(404).render("errors/error404", { error: "Menu não encontrado" });
        }

        // Apagar foto do menu
        if (menu.photo && fs.existsSync("public" + menu.photo)) {
            fs.unlinkSync("public" + menu.photo);
        }

        // Apagar fotos dos pratos
        menu.dishes.forEach(dish => {
            if (dish.photo && fs.existsSync("public" + dish.photo)) {
                fs.unlinkSync("public" + dish.photo);
            }
        });

        // Remover menu do array
        restaurant.menus.pull(menu);
        await restaurant.save();

        res.redirect(`/restaurants/${restaurant.name}`);

    } catch (err) {
        res.render("errors/error500", { error: err });
    }
};
  
//Permite com detalhes o prato especifico de um menu
restaurantController.showDish = function(req, res) {
    Dish.findOne({_id: req.params.id}).exec(function (err, dish) {
        if(err) {
            console.log("Erro: ", err);
            res.redirect(res.locals.previousPage);
        } else {
            res.render("restaurants/restaurant/Dishs/showDish", {dish: dish});
        }
    });
};

//Renderiza a pagina para a criação das dishs
restaurantController.createDish = function(req, res) {
    //Carrego todas as categorias existentes e mando para o createDish
    renderCreateDish(res);
};

//Codigo que guarda uma dish
/*
Depois meter o resto do codigo, para associar a dish a um menu especifico de um restaurante especifico
Meter depois verificações a ver se esta Dish já não existie
*/ 

/*
Falta guaradar a imagem no public e guardar o caminho no mongo
*/
restaurantController.saveDish = function(req, res) {
    

    let dish = new Dish({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        photo: caminho
    });
    

    dish.save(function(err) {
        if(err) {
            console.log(err);
            renderCreateDish(res);
        } else {
            console.log("Prato guardado com sucesso");
            res.redirect("/restaurants/restaurant/menu/showDish/" + dish._id);
        }
    })
}

//Reencaminha para a pagina de edita
restaurantController.editDish = function(req, res) {
    let dish = null;
    try {
        dish = Dish.findOne({_id: req.params.id}).exec();
        renderEditDish(res, dish);
    } catch (err) {
        console.log("Erro ao procurar a dish: ", err);
        res.redirect("/restaurants/restaurant/menu/");
    }
};

//Atualiza uma dish existente
restaurantController.updateDish = function(req, res) {

};

//Apaga uma dish existente (Aqui falta apagar para o restaurante especifico)
restaurantController.deleteDish = function(req, res) {
    Dish.remove({_id: req.params.id}, function(err) {
        if(err) {
            console.log("Ocorreu um problema a eliminar o prato");
            res.render("/restaurants/restaurant/menu")
        } else {
            console.log("Prato eliminado com sucesso");
            res.redirect("/restaurants/restaurant/menu/")
        }
    })
};

async function saveImage(req, res) {
    return new Promise((resolve, reject) => {
        const storageLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                const menuName = req.body.name.replace(/[^a-zA-Z0-9]/g, '_');
                const pathFolder = `public/images/Restaurants/${req.params.restaurant}/Menus/${menuName}/`;
                fs.mkdirSync(pathFolder, { recursive: true });
                cb(null, pathFolder);
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });

        const uploadLogo = multer({ 
            storage: storageLogo,
            fileFilter: function (req, file, cb) {
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                } else {
                    cb(new Error('Apenas imagens são permitidas!'), false);
                }
            }
        }).any(); // Processa todos os arquivos

        uploadLogo(req, res, function(err) {
            if (err) {
                console.error('Erro no upload:', err);
                return reject(err);
            }
            resolve();
        });
    }); 
}
/* SE DEIXAR DE DAR, DESCOMENTAR O CODIGO A BAIXO
// Configurando o storage para salvar as fotos dos pratos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Cria um caminho para armazenar as imagens: 
      // "public/images/Restaurants/<nomeRestaurant>/Menus/<nomeMenu>/"
      const pathFolder = "public/images/Restaurants/" + req.params.restaurant + "/Menus/" + req.body.menuName + "/";
      try {
        fs.mkdirSync(pathFolder, { recursive: true });
        console.log('Pasta criada com sucesso!');
      } catch (err) {
        console.error('Erro ao criar a pasta:', err);
      }
      cb(null, pathFolder);
    },
    filename: function (req, file, cb) {
      // Prefixo com timestamp para evitar nomes duplicados
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Cria o upload middleware que aceita qualquer arquivo
  const upload = multer({ storage: storage }).any();
*/
module.exports = restaurantController;