var mongoose = require("mongoose");

var Portion = require("../../Models/Portion");
var portionsController = {};

const maxPortions = 15

portionsController.homePage = function(req, res) {
    Portion.find({}).exec()
        .then(function(portions) {
            res.render("perfil/admin/PagesAdmin/Portions/listPortions", {portions: portions, filters: {}});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).render("errors/error", {numError: 500, error: err});
        });  
};

portionsController.search = async function(req, res) {
    try {
        let query = {};
        const { portion = '', order = 'no'} = req.query;
        
        if (portion) {
            query.portion = { "$regex": portion, "$options": "i" };
        }
        
        let sortObj = null;
        switch (order) {
            case 'nameAsc': {
                sortObj = { portion: 1 };
                break;
            } case 'nameDesc': {
                sortObj = { portion: -1 };
                break;
            } default: {
                break;
            }
        }
        
        let portions = null;    
        if (sortObj) {
            portions = await Portion.find(query).sort(sortObj).exec(); 
        } else {
            portions = await Portion.find(query).exec()
        }
        
        res.render("perfil/admin/PagesAdmin/Portions/listPortions", {portions: portions, filters: {portion, order}});
    } catch(error) {
        res.status(500).render("errors/error", {numError: 500, error: error});
    } 
};
portionsController.createPortion = function(req, res) {
    res.render('perfil/admin/PagesAdmin/Portions/createPortions');
}

function validationPortion(portion) {
    return new Promise((resolve, reject) => {
        
        if (portion === "") {
            resolve("Porção vazia");
        }

        Portion.find({}).exec()
            .then(portions => {
                
                if(portions.length >= maxPortions) {
                    resolve("Numero maximo de Porções (" + maxPortions + ") atingido!");
                }

                let i = 0;
                let problem = "";
                let find = false;

                while(i < portions.length && !find) {
                    if(portion.toLowerCase() === portions[i].portion.toLowerCase()) {
                        problem = "Porção: " + portion + " já existe";
                        find = true;
                    }

                    i++;
                }

                resolve(problem);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}

portionsController.savePortion = async function(req, res) {
    try {
        const validation = await validationPortion(req.body.portion);
        if(validation !== "") {
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        }

        const newPortion = new Portion(req.body)

        await newPortion.save();

        console.log("Porção guardada com sucesso");
        res.redirect("/perfil/admin/listPortions")
    } catch(err) {
        console.log("Erro: ", err);
        res.render('perfil/admin/PagesAdmin/Portions/createPortions');
    }
}

portionsController.editPortion = async function(req, res) {
    try {
        const portion = await Portion.findOne({_id: req.params.portionId}).exec();
        
        res.render('perfil/admin/PagesAdmin/Portions/editPortions', {portion: portion});
    } catch(err) {
        console.log("Erro: ", err);
        res.render('perfil/admin/PagesAdmin/Portions/listPortions');
    }
}

portionsController.updatPortion = async function(req, res) {
    try {    
        console.log("Estou no update");
        let portion = await Portion.findOne({_id: req.params.portionId}).exec();

        if(!portion) {
            return res.status(500).render("errors/error", {numError: 500, error: "A Porção não existe"});
        }

        const validation = await validationPortion(req.body.portion);
        
        if(validation !== "") {
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        }

        portion.portion = req.body.portion;
        await portion.save();

        console.log("Porção alterada com sucesso");
        res.redirect("/perfil/admin/listPortions")
    } catch(err) {
        console.log("Erro: ", err);
        res.render('perfil/admin/PagesAdmin/Portions/editPortions', {portion: req.body});
    }
}

portionsController.deletePortion = async function(req, res) {
    try {
        await Portion.deleteOne({ _id: req.params.portionId });
        console.log("Porção eliminada!");
        res.redirect("/perfil/admin/listPortions");
    } catch (error) {
        console.log("Error", error);
        res.status(500).render("errors/error", {numError: 500, error: error});
    }
}

module.exports = portionsController;