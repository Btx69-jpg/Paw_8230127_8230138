const Category = require("../../Models/Reusable/Category");

async function carregarCategories() {
    let categories = []
    try {
        categories = await Category.find({}).exec();
    } catch (err) {
        console.error(err);
    }
    return categories;
}

async function carregarCategoriesMenu(menu) {
    let categories = [];
    let categoriesMenu = [];
    try {
        categories = await Category.find({}).exec();

        for (let i = 0; i < menu.dishes.length; i++) {
            let found = false;
            let y = 0;

            while (y < categories.length && !found) {
                if (menu.dishes[i].category === categories[y].category) {
                    let exists = false;

                    for (let z = 0; z < categoriesMenu.length; z++) {
                        if (categoriesMenu[z] === categories[y].category) {
                            exists = true;
                        }
                    }
  
                    if (!exists) {
                        categoriesMenu.push(categories[y].category);
                        found = true;
                    }
                }

                y++;
            }
        }
    } catch (err) {
        console.error(err);
    }
    return categoriesMenu;
}

async function carregarCategoriesMenus(menus) {
    let categories = [];
    let categoriesMenus = [];
    try {
        categories = await Category.find({}).exec();

        for (let i = 0; i < menus.length; i++) {
            let found = false;
            let y = 0;

            while (y < categories.length && !found) {
                if (menus[i].type === categories[y].category) {
                    let exists = false;
                    
                    for (let z = 0; z < categoriesMenus.length; z++) {
                        if (categoriesMenus[z] === categories[y].category) {
                            exists = true;
                        }
                    }
  
                    if (!exists) {
                        categoriesMenus.push(categories[y].category);
                        found = true;
                    }
                }

                y++;
            }
        }
    } catch (err) {
        console.error(err);
    }
    return categoriesMenus;
}
module.exports = {
    carregarCategories,
    carregarCategoriesMenu,
    carregarCategoriesMenus,
}