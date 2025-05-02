const express = require("express");
const router = express.Router();

//Controller
const userController = require("../../../Controllers/ControllersAdmin/UsersController.js");

/**
 * * Rota que carrega a pagina, com a lista de todos os utilizadores do site.
 * */
router.get("/", userController.homePage);

/**
 * * Rota para filtrar pelos utilizadores, e definir o criterio de ordenação
 * */
router.get("/search", userController.search);

/**
 * * Rota que carrega a pagina para visualizar os dados de um utilizador especifico 
 * 
 * * userId --> id do utilizador a ser consultado.
 * */
router.get("/showUser/:userId", userController.showUser);

/**
 * * Rota que carrega a pagina para a criação de um novo utilizador
 * */
router.get("/createUser", userController.createUser);

/**
 * * Rota que guarda o novo utilizador, criado na página "/createUser"
 * */
router.post("/saveUser", userController.saveUser);

/**
 * * Rota que carrega a pagina para edição dos dados de um utilizador
 * 
 * * userId --> id do user a ser editado
 * */
router.get("/editUser/:userId", userController.editPage);

/**
 * * Rota que guarda as alterações realizadas a um utilizador, já existente.
 * * Alterações essas, realizadas na rota "/editUser/:userId"
 * 
 * * userId --> id do user que foi editado.
 * */
router.post("/updateUser/:userId", userController.updateUser);

/**
 * * Rota que permite eliminar um utilizador da BD
 * 
 * * userId --> id do user eliminado.
 * */
router.post("/delete/:userId", userController.deleteUser);

/**
 * * Rota que permite banir um utilizador do site. 
 * * O tempo de banimento do user, por enquanto, é até algum admin o desbanir.
 * 
 * * userId --> id do utilizador a ser banido
 * */
router.post("/ban/:userId", userController.ban);

/**
 * * Rota que permite desbanir um utilizador, que esteja banido no site. 
 * 
 * * userId --> id do utilizador a ser desbanido
 * */
router.post("/desban/:userId", userController.desban);

module.exports = router;