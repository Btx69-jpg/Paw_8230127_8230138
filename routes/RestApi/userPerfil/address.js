const express = require("express");
const router = express.Router({ mergeParams: true });

//Controllers
const manageController = require("../../../Controllers/ControllersPerfil/ControllersUser/AddressController.js");

/**
 * TODO: TTestar as rotas e terminar os controllers do edit e remover.
 */

/**
 * * Rota que carrega a pagina de perfil do utilizador
 */
router.get("/", manageController.getAddresses);

/**
 * * Rota que permite criar uma morada
 */
router.post("/", manageController.createAddress);

/**
 * * Rota que retorna os dados de uma morada especifica de um utilizador.
 * 
 * * addressId --> Id da morada a consultar
 */
router.get("/:addressId", manageController.getAddress);

/**
 * * Rota que atualiza uma morada já existente de um utilizador especifico
 * 
 * * addressId --> Id da morada a ser atualizada
 */
router.put("/:addressId", manageController.editAddress);

/**
 * * Rota que permite eliminar nova morada
 * 
 * * addressId --> Id da morada a ser eliminada
 */
router.delete("/:addressId", manageController.deleteAddress);
module.exports = router;