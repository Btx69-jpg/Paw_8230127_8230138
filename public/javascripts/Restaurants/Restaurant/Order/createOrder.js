document.addEventListener('DOMContentLoaded', () => {
    const menusData = JSON.parse(document.getElementById('menus-data').textContent);
    const portionsData = JSON.parse(document.getElementById('portions-data').textContent);
    const pratosSelect = document.getElementById('pratos');
    const porcaoSelect = document.getElementById('porcao');
    const container = document.getElementById('selectedItemsList');
    const totOrderInp = document.getElementById('totEncomenda');
    let nextIndex = 0;
  
    function preencherPratos(menuName) {
        pratosSelect.innerHTML = `<option value="all">-- Escolha um prato --</option>`;
        porcaoSelect.innerHTML = `<option value="all">-- Escolha uma porção --</option>`;
        porcaoSelect.disabled = true;
    
        const menu = menusData.find(m => m.name === menuName);
        if (!menu) {
            pratosSelect.disabled = true;
            return;
        }
    
        pratosSelect.disabled = false;
        menu.dishes.forEach(dish => {
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
    
        const allDishes = menusData.flatMap(menu => menu.dishes);

        let portionDish = [];
        let i = 0;
        let found = false;
    
        while(i < allDishes.length && !found) {
            if(pratosSelect.value === allDishes[i].name) {
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

            while (y < portionsData.length && !found) {
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
            porcaoSelect.appendChild(option);
        }
    }
  
    function adicionarPrato() {
        if (pratosSelect.value === 'all' || porcaoSelect.value === 'all') {
            alert('Escolha primeiro um prato e uma porção.');
            return;
        }
  
        const pratoNome = pratosSelect.selectedOptions[0].textContent;
        const priceNum = parseFloat(porcaoSelect.selectedOptions[0].dataset.price);
        const porcao = porcaoSelect.selectedOptions[0].value;
    
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
            const qtyInp = existingDiv.querySelector('input.quantity');
            const priceInp = existingDiv.querySelector('input.price');
            qtyInp.value = parseInt(qtyInp.value, 10) + 1;
            priceInp.value = (parseFloat(priceInp.value) + priceNum).toFixed(2);
        } else {
            const idx = nextIndex++;
            const div = document.createElement('div');
            div.classList.add('list-group-item','d-flex','align-items-center','mb-2','gap-3');
            div.dataset.prato = pratoNome;
            div.dataset.porcao = porcao;
            div.dataset.index = idx;
    
            const inputItem = document.createElement('input');
            inputItem.type = 'text';
            inputItem.name = `item[${idx}][item]`;
            inputItem.value = pratoNome;
            inputItem.readOnly = true;
            inputItem.classList.add('form-control','form-control-sm','ms-auto', 'item');
    
            const inputPorcao = document.createElement('input');
            inputPorcao.type = 'text';
            inputPorcao.name = `item[${idx}][portion]`;
            inputPorcao.value = porcao;
            inputPorcao.readOnly = true;
            inputPorcao.classList.add('form-control','form-control-sm','ms-auto');
    
            const priceBaseInput = document.createElement('input');
            priceBaseInput.type = 'number';
            priceBaseInput.step = '0.01';
            priceBaseInput.name = `item[${idx}][priceBase]`;
            priceBaseInput.value = priceNum.toFixed(2);
            priceBaseInput.disabled = true;
            priceBaseInput.classList.add('form-control','form-control-sm','ms-auto','precoBase'); 

            const priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.step = '0.01';
            priceInput.name = `item[${idx}][price]`;
            priceInput.value = priceNum.toFixed(2);
            priceInput.readOnly = true;
            priceInput.classList.add('form-control','form-control-sm','ms-auto','price');
            priceInput.style.width = '80px';
    
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.step = '1';
            qtyInput.min = '1';
            qtyInput.max = '10';
            qtyInput.name = `item[${idx}][quantity]`;
            qtyInput.value = '1';
            qtyInput.classList.add('form-control','form-control-sm','ms-auto','quantity');
            qtyInput.style.width = '60px';
            qtyInput.addEventListener('input', () => changeQuantity(qtyInput));

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.classList.add('btn','btn-outline-danger','btn-sm','ms-2');
            btn.textContent = 'Remover';
            btn.addEventListener('click', () => removeItem(btn));
    
            div.append(inputItem, inputPorcao, priceBaseInput, priceInput, qtyInput, btn);
            container.appendChild(div);
        }
  
        totOrderInp.value = ((parseFloat(totOrderInp.value) || 0) + priceNum).toFixed(2);
        pratosSelect.value = 'all';
        porcaoSelect.value = 'all';
        porcaoSelect.disabled = true;
    }
  
    function removeItem(btn) {
        const itemDiv = btn.closest('div');
        
        if (!itemDiv) { 
            return;
        }

        const priceInp = itemDiv.querySelector('input.price');
        const price = parseFloat(priceInp.value);
        totOrderInp.value = Math.max(0, (parseFloat(totOrderInp.value) || 0) - price).toFixed(2);
        itemDiv.remove();
    }

    /*
    Meter para quando diminuir ou aumentar alterar os valores
    Verificar se caso tente meter para cima de 10 ou diminuir para 0, para não deixar
    Devo ter que criar um campo que guarde o preço base daquela porção, para facilitar aqui o diminuir ou aumentar preços
    */
    function changeQuantity(qtyInput) {
        const itemDiv = qtyInput.closest('div');
        if (!itemDiv) {
            return;
        }

        const quantidade = parseInt(qtyInput.value, 10);
        if(quantidade <= 0) {
            qtyInput.value = '1';
            alert = "A quantidade não pode ser negativa ou 0";
            return;
        } else if(quantidade > 10) {
            qtyInput.value = '10';
            alert = "A quantidade não pode ser superior a 10";
            return;
        } else if(!quantidade) {
            qtyInput.value = '1';
            alert('A quantidade tem de exisitir');
            return;
        }

        const priceInp = itemDiv.querySelector('input.price');
        const baseInp = itemDiv.querySelector('input.precoBase');
        const totOrderInp = document.getElementById('totEncomenda');

        const precoBase = parseFloat(baseInp.value);
        const prevPreco = parseFloat(priceInp.value);
        const novoPreco = precoBase * quantidade;

        priceInp.value = novoPreco.toFixed(2);
        const totAntigo = parseFloat(totOrderInp.value) || 0;
        const totNovo = totAntigo - prevPreco + novoPreco;
        totOrderInp.value = totNovo.toFixed(2);
    }

    window.preencherPratos = preencherPratos;
    window.carregarPortions = carregarPortions;
    window.adicionarPrato = adicionarPrato;
    window.changeQuantity = changeQuantity;

    const menuSelect = document.getElementById('menuSelect');
    if (menuSelect) { 
        menuSelect.addEventListener('change', e => preencherPratos(e.target.value));
    }

    pratosSelect.addEventListener('change', carregarPortions);
});