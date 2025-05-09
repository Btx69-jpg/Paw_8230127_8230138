var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Models
var User = require("../../Models/Perfils/User");

var passwordController = {};

async function validateNewPassowrd(atualPassword, newPassword, confirmNewPassword, userPassword) {
  if (!atualPassword || !newPassword || !confirmNewPassword) {
    return "Algum dos campos de preenchimento obrigatorio, não está preenchido"
  }

  if (atualPassword.length < 8) {
    return "O campo password atual tem de ter no minimo 8 caracteres";
  }

  if (newPassword.length < 8) {
    return "O campo nova password tem de ter no minimo 8 caracteres";
  }

  if (confirmNewPassword.length < 8) {
    return "O campo confirme a nova password tem de ter no minimo 8 caracteres";
  }
  
  if (newPassword !== confirmNewPassword) {
    return "As novas password não coincidem";
  }

  if (!(await bcrypt.compare(atualPassword, userPassword))) {
    return "A passowd atual inserida está incorreta";
  }

  if (await bcrypt.compare(newPassword, userPassword)) {
    return "A nova password é igual há antiga";
  }

  return "";
}

passwordController.updatePassword = async function(req, res) {
  try {
    const userId = req.params.userId;
    let account = await User.findById(userId).exec();
    
    if (!account) {
      return res.status(404).json({error: "O utilizador não foi encontrado"});
    }

    if(!account.perfil) {
      return res.status(404).json({error: "O utilizador não possui nenhum perfil"});
    }

    const {atualPassword, newPassword, confirmNewPassword} = req.body;

    let validation = await validateNewPassowrd(atualPassword, newPassword, confirmNewPassword, account.perfil.password);
    if (validation !== "") {
      return res.status(422).render({error: validation});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    account.perfil.password = hashedNewPassword;
    await account.save();

    console.log("Password atualizada com sucesso");
    res.status(204).json();
  } catch (error) {
    console.error("Error", error);
    res.status.json({error: error})
  }
};

module.exports = passwordController;
