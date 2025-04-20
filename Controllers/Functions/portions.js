//Controllers
const Portion = require("../../Models/Reusable/Portion");

//Criar uma para ver pelo menu e pelos menus como a categories
async function carregarPortions() {
    let portions = [];
    try {
        portions = await Portion.find({}).exec();
    } catch (err) {
        console.error(err);
        portions = null;
    }
    return portions;
}


module.exports = {
    carregarPortions, 
}