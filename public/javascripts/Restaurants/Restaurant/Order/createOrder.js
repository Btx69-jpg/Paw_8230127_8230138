function preencherPratos(menuName) {
    const pratosSelect = document.getElementById('pratos');
    pratosSelect.innerHTML = '<option value="all">-- Escolha um prato --</option>'; //Apago os pratos antigos

    // recupera o array de menus do JSON
    const menus = JSON.parse(document.getElementById('menus-data').textContent);
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
        opt.setAttribute('data-price', dish.price);
        pratosSelect.appendChild(opt);
    });
}

function carregarPortions() {
    const prato = document.getElementById("pratos");
   
    if(prato.value === "all") {
        alert('Por favor, escolha primeiro um prato.');
        return; 
    }
    
    // recupera o array de menus do JSON
    const menus = JSON.parse(document.getElementById('menus-data').textContent);
    console.log(menus);
    const allDishes = menus.flatMap(menu => menu.dishes);
    console.log(allDishes);
    let portionDish = [];
    let i = 0;
    let found = false;

    while(i < allDishes.length && !found) {
        if(prato.value === allDishes[i].name) {
            found = true;
            portionDish = allDishes[i].portions;
        } 

        i++;
    }

    if(portionDish.length === 0) {
        alert('Prato não existe ou não possui porções.');
        return; 
    }

    let portionSelect = document.getElementById("porcao");
    portionSelect.innerHTML = '<option value="all">-- Escolha uma porção --</option>';
    const portions = JSON.parse(document.getElementById('portions-data').textContent);

    for (let j = 0; j < portionDish.length; j++) {
        let y = 0;
        let found = false;
        while(y < portions.length && !found) {
            if(portions[y]._id.toString() === portionDish[j].portion.toString()) {
                found = true;
            } else {
                y++;
            }
            
        }

        let option = document.createElement("option");

        option.value = portions[y].portion;
        option.textContent = `${portions[y].portion} — €${portionDish[j].price.toFixed(2)}`;
        option.dataset.price = portionDish[j].price;
        portionSelect.appendChild(option);
    }

    portionSelect.disabled = false;
}

function adicionarPrato() {
    const pratosSel = document.getElementById('pratos');
    const porcSel = document.getElementById('porcao');
    const ul = document.getElementById('selectedItemsList');
    const totOrderInp = document.getElementById('totEncomenda');

    if (pratosSel.value === 'all' || porcSel.value === 'all') {
      alert('Escolha primeiro um prato e uma porção.');
      return;
    }

    const pratoNome = pratosSel.options[pratosSel.selectedIndex].textContent;
    const priceNum  = parseFloat(porcSel.options[porcSel.selectedIndex].dataset.price);

    let existingLi = null;
    const itens = ul.children;
    let i = 0; 
    let found = false;

    while (i < itens.length && !found) {
        if (itens[i].dataset.prato === pratoNome) {
            existingLi = itens[i];
            found = true;
        }

        i++;
    }
      
    if (existingLi) {
        const qtyInp = existingLi.querySelector('input.quantidade');
        const priceInp = existingLi.querySelector('input.preco');

        qtyInp.value = parseInt(qtyInp.value, 10) + 1;
        const newPrice = parseFloat(priceInp.value) + priceNum;
        priceInp.value = newPrice.toFixed(2);
    } else {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'align-items-center');
        li.dataset.prato = pratoNome; 

        const span = document.createElement('span');
        span.textContent = pratoNome;

        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.step = '0.01';
        priceInput.disabled = true;
        priceInput.classList.add('form-control', 'form-control-sm', 'ms-auto', 'preco');
        priceInput.style.width = '80px';
        priceInput.value = priceNum.toFixed(2);

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.step = '1';
        qtyInput.min = 1;
        qtyInput.max = 10;
        qtyInput.classList.add('form-control', 'form-control-sm', 'ms-auto', 'quantidade');
        qtyInput.style.width = '60px';
        qtyInput.value = 1;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('btn', 'btn-outline-danger', 'btn-sm');
        btn.textContent = 'Remover';
        btn.addEventListener('click', () => removeItem(btn));

        li.append(span, priceInput, qtyInput, btn);
        ul.appendChild(li);
    }

    const currentTot = parseFloat(totOrderInp.value) || 0;
    totOrderInp.value = (currentTot + priceNum).toFixed(2);

    pratosSel.value = 'all';
    porcSel.value = 'all';
}

function removeItem(btn) {
    const itemRemove = btn.closest('li');
    
    if (itemRemove) {
        const totOrderInp = document.getElementById('totEncomenda');
        const priceInput = itemRemove.querySelector('.preco');
        const price = parseFloat(priceInput.value);
        const currentTot = parseFloat(totOrderInp.value) || 0;
        let newTotal = currentTot - price;
        
        if (newTotal < 0) {
            newTotal = 0;
        }

        totOrderInp.value = newTotal.toFixed(2);
        itemRemove.remove();
    }
};