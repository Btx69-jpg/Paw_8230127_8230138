var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Models
var User = require("../../Models/Perfils/User");

var passwordController = {};

async function validateNewPassowrd(body, userPassword) {
  if (body.newPassword !== body.confirmNewPassword) {
    return "As novas password não coincidem";
  }

  let problem = "";

  if (!(await bcrypt.compare(body.atualPassword, userPassword))) {
    return "A passowd atual inserida está incorreta";
  }

  if (await bcrypt.compare(body.newPassword, userPassword)) {
    return "A nova password é igual há antiga";
  }

  return problem;
}

passwordController.updatePassword = async function(req, res) {
  try {
    const userId = req.params.userId;
    let account = await User.findById(userId).exec();
    
    if (!account) {
      return res.status(404).json({error: "O utilizador não foi encontrado"});
    }

    let validation = await validateNewPassowrd(req.body, account.perfil.password);
    if (validation !== "") {
      return res.status(422).render({error: validation});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

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
