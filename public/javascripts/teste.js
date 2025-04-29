document.addEventListener('DOMContentLoaded', () => {
    let nextIndex = 0;
  
    const menusData = JSON.parse(document.getElementById('menus-data').textContent);
    const portionsData = JSON.parse(document.getElementById('portions-data').textContent);
    const pratosSelect = document.getElementById('pratos');
    const porcaoSelect = document.getElementById('porcao');
    const container = document.getElementById('selectedItemsList'); // <div id="selectedItemsList">
    const totOrderInp = document.getElementById('totEncomenda');     // <input id="totEncomenda">
  
    function preencherPratos(menuName) {
        pratosSelect.innerHTML = '<option value="all">-- Escolha um prato --</option>';
        porcaoSelect.innerHTML = '<option value="all">-- Escolha uma porção --</option>';
        porcaoSelect.disabled = true;
    
        const escolhido = menusData.find(m => m.name === menuName);
        if (!escolhido) {
            pratosSelect.disabled = true;
            return;
        }
    
        pratosSelect.disabled = false;
        escolhido.dishes.forEach(dish => {
            const opt = document.createElement('option');
            opt.value = dish.name;
            opt.textContent = dish.name;
            opt.dataset.price = dish.price;
            pratosSelect.appendChild(opt);
        });
    }
  
    function carregarPortions() {
        if (pratosSelect.value === 'all') {
            alert('Por favor, escolha primeiro um prato.');
            return;
        }
    
        const allDishes = menus.flatMap(menu => menu.dishes);

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

        if (portionDish.length === 0) {
            alert('Prato não existe ou não possui porções.');
            return; 
        }
    
        porcaoSelect.innerHTML = '<option value="all">-- Escolha uma porção --</option>';
        porcaoSelect.disabled = false;
    
        for (let j = 0; j < portionDish.length; j++) {
            let y = 0;
            let found = false;

            while(y < portionsData.length && !found) {
                if(portionsData[y]._id.toString() === portionDish[j].portion.toString()) {
                    found = true;
                } else {
                    y++;
                }
                
            }

            let option = document.createElement("option");

            option.value = portionsData[y].portion;
            option.textContent = `${portionsData[y].portion} — €${portionDish[j].price.toFixed(2)}`;
            option.dataset.price = portionDish[j].price;
            option.dataset.portion = portionDish[j].portion;
            portionSelect.appendChild(option);
        }
    }
  
    function adicionarPrato() {
        if (pratosSelect.value === 'all' || porcaoSelect.value === 'all') {
            alert('Escolha primeiro um prato e uma porção.');
            return;
        }
  
        const pratoNome = pratosSelect.selectedOptions[0].textContent;
        const priceNum  = parseFloat(porcaoSelect.selectedOptions[0].dataset.price);
        const porcao = porcaoSelect.selectedOptions[0].value;
    
        //Verificar também pela porção
        let existingDiv = null;
        const itens = container.children;
        let i = 0; 
        let found = false;
    
        while (i < itens.length && !found) {
            if (itens[i].dataset.prato === pratoNome && itens[i].dataset.porcao === porcao) {
                existingDiv = itens[i];
                found = true;
            }
    
            i++;
        }
    
        if (existingDiv) {
            const qtyInp = existingDiv.querySelector('input.quantidade');
            const priceInp = existingDiv.querySelector('input.preco');
            qtyInp.value = parseInt(qtyInp.value, 10) + 1;
            priceInp.value = (parseFloat(priceInp.value) + priceNum).toFixed(2);
        } else {
            const idx = nextIndex++;
            const div = document.createElement('div');
            div.classList.add('list-group-item','d-flex','align-items-center','mb-2','gap-3');
            div.dataset.prato = pratoNome;
            div.dataset.index = idx;
    
            const inputItem = document.createElement('input');
            inputItem.type = 'text';
            inputItem.name = `item[${idx}][item]`;
            inputItem.value = pratoNome;
            inputItem.disabled  = true;
            inputItem.classList.add('form-control','form-control-sm','ms-auto');
    
            const inputPorcao = document.createElement('input');
            inputPorcao.type = 'text';
            inputPorcao.name = `item[${idx}][porcao]`;
            inputPorcao.value = pratoNome;
            inputPorcao.disabled  = true;
            inputPorcao.classList.add('form-control','form-control-sm','ms-auto');
    
            const priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.step = '0.01';
            priceInput.name = `item[${idx}][price]`;
            priceInput.value = priceNum.toFixed(2);
            priceInput.disabled = true;
            priceInput.classList.add('form-control','form-control-sm','ms-auto','preco');
            priceInput.style.width = '80px';
    
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.step = '1';
            qtyInput.min = '1';
            qtyInput.max = '10';
            qtyInput.name = `item[${idx}][quantidade]`;
            qtyInput.value = '1';
            qtyInput.classList.add('form-control','form-control-sm','ms-auto','quantidade');
            qtyInput.style.width = '60px';
    
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.classList.add('btn','btn-outline-danger','btn-sm','ms-2');
            btn.textContent = 'Remover';
            btn.addEventListener('click', () => removeItem(btn));
    
            div.append(inputItem, inputPorcao, priceInput, qtyInput, btn);
            container.appendChild(div);
        }
  
      totOrderInp.value = ( (parseFloat(totOrderInp.value) || 0) + priceNum ).toFixed(2);
      pratosSelect.value = 'all';
      porcaoSelect.value = 'all';
      porcaoSelect.disabled = true;
    }
  
    function removeItem(btn) {
        const itemDiv = btn.closest('div');
        
        if (!itemDiv) {
            return;
        }

        const priceInp = itemDiv.querySelector('input.preco');
        const price = parseFloat(priceInp.value);
        totOrderInp.value = Math.max(0, (parseFloat(totOrderInp.value) || 0) - price).toFixed(2);
        itemDiv.remove();
    }
});