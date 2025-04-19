const Category = require("../../Models/Reusable/Category");

async function carregarCategories() {
    let categories = []
    try {
        categories = await Category.find({}).exec();
    } catch (err) {
        console.error(err);
        categories = null;
    }
    return categories;
}

module.exports = {
    carregarCategories,
}