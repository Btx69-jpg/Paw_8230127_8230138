const express = require("express");
const router = express.Router();

//Models
const categoriesController = require("../../Controllers/ControllersAdmin/CategoriesController.js");

//Middlewares
//Autentificação de token e de tipo de utilizador
const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isAdmin} = require("../../Middleware/TypeUserMiddleware.js");

/**
* Rota utilizada para aplicar os seguintes middleware as restantes rotas
*/
router.use(authenticateToken, isAdmin);

/**
 * Rota que carrega a pagina, com uma lista de todas as categorias
 */
router.get("/", categoriesController.homePage);

/**
 * Rota que que permite filtrar e ordernar dados na pagina das categorias
 */
router.get("/search", categoriesController.search);

/**
 * Rota que carrega a pagina para criar uma categoria
 */
router.get("/createCategory", categoriesController.createCategory);

/**
 * Rota que guarda uma categoria, criada na página de criação de uma categoria
 */
router.post("/saveCategory", categoriesController.saveCategory);

/** 
 * Rota que carrega a pagina para editar uma categoria
 * Esta rota tem como paramentro o categoryId, que corresponde ao ID da categoria, a ser atualizada
*/
router.get("/editCategory/:categoryId", categoriesController.editCategory);

/**
 * Rota que faz o update dos dados de uma categoria
 * Esta rota tem como paramentro o categoryId, que corresponde ao ID da categoria, a ser atualizada
 */
router.post("/updatCategory/:categoryId", categoriesController.updatCategory);

/**
 * Rota que faz o delete de uma categoria especifica
 * Esta rota tem como paramentro o categoryId, que corresponde ao ID da categoria, a ser atualizada
 */
router.post("/deletetCategory/:categoryId", categoriesController.deleteCategory);

module.exports = router;