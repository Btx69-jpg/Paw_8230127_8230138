var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Models
var Restaurant = require("../Models/Perfils/Restaurant");
var User = require("../Models/Perfils/User");
var passwordController = {};

passwordController.editPassword = async function (req, res) {
  console.log();
  console.log();
  console.log();
  console.log();
  console.log();
  console.log();
  console.log();
  console.log();
  console.log("---------------------------------");
  console.log("Edit Password");
  try {
    const priority = req.cookies.priority;
    const accountId = req.params.accountId;
    let account = null;

    if (priority === "Restaurant") {
      account = await Restaurant.findOne({ _id: accountId }).exec();
    } else {
      account = await User.findOne({ _id: accountId }).exec();
    }

    if (!account) {
      return res.status(404).render("errors/error", { numError: 404, error: "A conta não existe" });
    }

    let action = "";
    console.log(res.locals.currentPage);
    switch(res.locals.currentPage) {
      case `/perfil/admin/editPassword/${accountId}`: {
        if (priority !== "Admin") {
          return res.status(403).render("errors/error", { numError: 403 });
        }
        action = `/perfil/admin/changePassword/${accountId}`;
        voltar = `/perfil/admin`;
        break;
      } case `/restaurants/editRestaurant/editPassword/${accountId}`: {
        if (priority !== "Restaurant") {
          return res.status(403).render("errors/error", { numError: 403 });
        }
        action = `/restaurants/editRestaurant/changePassword/${accountId}`;
        voltar = `/restaurants/editRestaurant/${accountId}`;
        break;
      } case `/perfil/user/editPassword/${accountId}`: {
        if (priority !== "User") {
          return res.status(403).render("errors/error", { numError: 403 });
        }
        action = `/perfil/user/changePassword/${accountId}`;
        voltar = `perfil/user/${accountId}`
        break;
      }
      default: {
        return res.status(404).render("errors/error404");
      }
    }

    res.render("login/editPassword", { account: account, action: action });
  } catch (error) {
    console.log("Error", error);
    res.redirect(res.locals.previousPage);
  }
};

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

/*
TODO: Alterar rotas
*/
passwordController.updatePassword = async (req, res) => {
  console.log("Update Password");
  const priority = req.cookies.priority;

  try {
    let account = null;

    if (priority === "Restaurant") {
      account = await Restaurant.findOne({ _id: req.params.accountId }).exec();
    } else {
      account = await User.findOne({ _id: req.params.accountId }).exec();
    }

    if (!account) {
      return res.status(404).render("errors/error", { numError: 404, error: "A conta não existe" });
    }

    let validation = await validateNewPassowrd(
      req.body,
      account.perfil.password
    );

    if (validation !== "") {
      return res.status(500).render("errors/error", { numError: 500, error: validation });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

    account.perfil.password = hashedNewPassword;
    await account.save();

    console.log("Password atualizada com sucesso");

    switch(priority) {
      case "Restaurant": {
        res.redirect(`/restaurants/editRestaurant/${req.params.accountId}`);
        break;
      } case "Admin": {
        res.redirect(`/perfil/admin`);
        break;
      } case "User": {
        res.redirect(`/perfil/user/${req.params.accountId}`);
        break;
      } default: {
        return res.status(403).render("errors/error", {numError: 403, error: "Não tem permissão para aceder a esta página"})
        break;
      }
    }
  } catch (error) {
    console.log("Error", error);

    if (priority === "Restaurant") {
      res.redirect(
        `/restaurants/editRestaurant/editPassword${req.params.accountId}`
      );
    } else if (priority === "Admin") {
      res.redirect(`/perfil/admin/editPassword/${req.params.accountId}`);
    }
  }
};

module.exports = passwordController;
