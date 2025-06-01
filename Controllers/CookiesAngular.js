const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
const cokkiesController = {};

const User = require("../Models/Perfils/User");

// Renderiza página de login
cokkiesController.authCheck = async function(req, res) {
  try{
    const userId = req.params.userId;
    if (!userId) {
      return res.status(403).json({ isAuth: false });
    }

    const token = req.cookies.auth_token || req.headers['authorization'];
    const priority = req.cookies.priority;
    
    if (!token || !priority) {
      return res.status(403).json({ isAuth: false });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
    } catch (err) {
      console.log("Token inválido:", err.message);
      return res.status(403).json({ isAuth: false });
    }

    //Ivita que vá há rota do angular e troque o id da rota para de outro utilizador diferente (sem ser o que está autenticado)
    if (userId !== req.user.userId) {
      console.log("Utilizador não é o mesmo que o da cookie")
      return res.status(403).json({ isAuth: false });
    }

    const user = await User.findById(req.user.userId).exec();

    if (!user) {
      console.error("O utilizador do token não existe")
      return res.status(403).json({ isAuth: false }); 
    }

    console.log("Prioridade",priority);
    console.log("Prioridade do user ",user.perfil.priority);
    if(priority !== user.perfil.priority) {
      console.error("A prioridade da cookie está errada")
      return res.status(403).json({ isAuth: false }); 
    }

    res.status(200).json({ 
      isAuth: true,
      userId: decoded.userId,
      priority: priority });
  } catch (error) {
    console.error("Erro na validação do token: ", error);
    res.status(500).json({error: error});
  }
};

async function authPriority(priority) {
  try {
    const prioridadesPermitidas = ['Cliente', 'Admin', 'Restaurant', 'Dono', 'Funcionario'];
    if (!priority) {
      return "Prioridade ausente";
    }

    if (!prioridadesPermitidas.includes(priority)) {
      return "A prioridade da cookie não é permitida"
    }

    return "";
  } catch (error) {
    console.error("Erro na validação da prioridade: ", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

cokkiesController.authIsDonoOrCliente = async function(req, res) {
  try {
    const priority = req.cookies.priority;
    console.log('Cookies recebidos:', req.cookies);
    const error = await authPriority(priority);
    if (error !== "") {
      console.log("Prioridade não encontrada")
      return res.status(403).json({ priority: ""});
    }

    if(priority === "Dono" || priority === "Cliente") {
      return res.status(200).json({priority: priority})
    } else {
      console.log("Prioridade invalida")
      return res.status(403).json({ priority: ""});
    }
  } catch (error) {
    console.error("Erro na validação da prioridade: ", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

module.exports = cokkiesController;