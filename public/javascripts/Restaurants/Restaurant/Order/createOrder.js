function preencherPratos(menuName) {
    const pratosSelect = document.getElementById('pratos');
    pratosSelect.innerHTML = '<option value="all">-- Escolha um prato --</option>'; //Apago os pratos antigos

    // recupera o array de menus do JSON
    const menus = JSON.parse(document.getElementById('menus-data').textContent);
    console.log(menus);
    const escolhido = menus.find(m => m.name === menuName);

    if (!escolhido) {
        pratosSelect.disabled = true;
        return;
    }

    pratosSelect.disabled = false;
    const optDefault = document.createElement('option');

    escolhido.dishes.forEach(dish => {
        const opt = document.createElement('option');
        opt.value = dish.name;
        opt.textContent = dish.name;
        pratosSelect.appendChild(opt);
    });
}