const express = require("express");
const router = express.Router();

//Models
const categoriesController = require("../../Controllers/ControllersAdmin/CategoriesController.js");

/**
 * * Rota que carrega a pagina, com uma lista de todas as categorias
 * */
router.get("/", categoriesController.homePage);

/**
 * * Rota que que permite filtrar e ordernar dados na pagina das categorias
 * */
router.get("/search", categoriesController.search);

/**
 * * Rota que carrega a pagina para criar uma categoria
 * */
router.get("/createCategory", categoriesController.createCategory);

/**
 * * Rota que guarda uma categoria, criada na página de criação de uma categoria
 * */
router.post("/saveCategory", categoriesController.saveCategory);

/** 
 * * Rota que carrega a pagina para editar uma categoria
 * 
 * * categoryId --> ID da categoria, que vai ser editada
 * */
router.get("/editCategory/:categoryId", categoriesController.editCategory);

/**
 * * Rota que faz o update dos dados de uma categoria
 * 
 * * categoryId --> ID da categoria, a ser atualizada
 * */
router.post("/updatCategory/:categoryId", categoriesController.updatCategory);

/**
 * * Rota que faz o delete de uma categoria especifica
 * 
 * * categoryId --> ID da categoria, a ser eliminada
 * */
router.post("/deletetCategory/:categoryId", categoriesController.deleteCategory);

module.exports = router;