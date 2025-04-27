var mongoose = require("mongoose");

var Category = require("../../Models/Category");
var categoriesController = {};

const maxCategories = 15

//metodo para renderizar a pagina de categorias	
categoriesController.homePage = function(req, res) {
    Category.find({}).exec()
        .then(function(categories) {
            res.render("perfil/admin/PagesAdmin/Categories/listCategories", {categories: categories, filters: {}});
        })
        .catch(function(err) {
            res.status(500).render("errors/error", {numError: 500, error: err});
        });  
};


categoriesController.search = async function(req, res) {
    try {
        let query = {};
        const { category = '', order = 'no'} = req.query;
        
        if (category) {
            query.category = { "$regex": category, "$options": "i" };
        }
        
        let sortObj = null;
        switch (order) {
            case 'nameAsc': {
                sortObj = { category: 1 };
                break;
            } case 'nameDesc': {
                sortObj = { category: -1 };
                break;
            } default: {
                break;
            }
        }
        
        let categories = null;    
        if (sortObj) {
            categories = await Category.find(query).sort(sortObj).exec(); 
        } else {
            categories = await Category.find(query).exec()
        }
        
        res.render("perfil/admin/PagesAdmin/Categories/listCategories", {categories: categories, filters: {category, order}});
    } catch(error) {
        res.status(500).render("errors/error", {numError: 500, error: error});
    } 
};

//metodo para renderizar a pagina de criar categorias
categoriesController.createCategory = function(req, res) {
    res.render('perfil/admin/PagesAdmin/Categories/createCategories');
}

//Função para validar se a categoria existe
//Verifica se a categoria já existe, se não existe, devolve erro
function validationCategory(category) {
    return new Promise((resolve, reject) => {
        
        if (category === "") {
            resolve("Cateogria vazia");
        }

        Category.find({}).exec()
            .then(categories => {
                
                if(categories.length >= maxCategories) {
                    resolve("Numero maximo de categorias (" + maxCategories + ") atingido!");
                }

                let i = 0;
                let problem = "";
                let find = false;

                while(i < categories.length && !find) {
                    if(category.toLowerCase() === categories[i].category.toLowerCase()) {
                        problem = "Categoria: " + category + " já existe";
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

//Função para salvar uma nova categoria
//Verifica se a categoria já existe, se não existe, guarda-a na base de dados
categoriesController.saveCategory = async function(req, res) {
    try {
        const validation = await validationCategory(req.body.category);
        if(validation !== "") {
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        }

        const newCategory = new Category(req.body)

        await newCategory.save();

        console.log("Categoria guardada com sucesso");
        res.redirect("/perfil/admin/listCategories")
    } catch(err) {
        console.log("Erro: ", err);
        res.render('perfil/admin/PagesAdmin/Categories/createCategories');
    }
}

//Função para editar uma categoria
//Verifica se a categoria existe, se não existe, devolve erro
//Caso exista, devolve a categoria para o front-end
categoriesController.editCategory = async function(req, res) {
    try {
        const category = await Category.findOne({_id: req.params.categoryId}).exec();
        
        res.render('perfil/admin/PagesAdmin/Categories/editCategories', {category: category});
    } catch(err) {
        console.log("Erro: ", err);
        res.render('perfil/admin/PagesAdmin/Categories/listCategories');
    }
}

//funcao para atualizar uma categoria
//Verifica se a categoria existe, se não existe, devolve erro
//Caso exista, atualiza a categoria na base de dados
categoriesController.updatCategory = async function(req, res) {
    try {    
        console.log("Estou no update");
        let category = await Category.findOne({_id: req.params.categoryId}).exec();

        if(!category) {
            return res.status(500).render("errors/error", {numError: 500, error: "A categoria não existe"});;
        }

        const validation = await validationCategory(req.body.category);
        
        if(validation !== "") {
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        }

        //Atualizo a categoria, sem a necessidade de dar outro update
        category.category = req.body.category;
        await category.save();

        console.log("Categoria alterada com sucesso");
        res.redirect("/perfil/admin/listCategories")
    } catch(err) {
        console.log("Erro: ", err);
        res.render('perfil/admin/PagesAdmin/Categories/editCategories', {category: req.body});
    }
}

//Função para eliminar uma categoria
//Verifica se a categoria existe, se não existe, devolve erro
categoriesController.deleteCategory = async function(req, res) {
    try {
        await Category.deleteOne({ _id: req.params.categoryId });
        console.log("Categoria eliminada!");
        res.redirect("/perfil/admin/listCategories");
    } catch (error) {
        res.status(500).render("errors/error", {numError: 500, error: error})
    }
}

module.exports = categoriesController;