document.addEventListener('DOMContentLoaded', () => {
    const prioritySelect = document.getElementById('priority');
    const wrapper = document.getElementById('restaurantsWrapper');
    const container = document.getElementById('restaurantsContainer');
    let nextIndex = 0;
  
    /**
     * Cria um bloco "label + input + remover" igual ao EJS.
     */
    function createRestaurantBlock(idx) {
        const div = document.createElement('div');
        div.classList.add('form-group', 'mb-3');
        div.id = `divRestaurant-${idx}`;
        div.dataset.index = idx;

        // Label por cima
        const label = document.createElement('label');
        label.htmlFor = `restaurant-${idx}`;
        label.textContent = 'Nome do restaurante';
        div.appendChild(label);

        // Flex row com input + botão
        const flex = document.createElement('div');
        flex.classList.add('d-flex', 'align-items-center');

        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('form-control', 'me-2');
        input.id = `restaurant-${idx}`;
        input.name = `restaurant[${idx}][name]`;
        input.placeholder = 'Introduza o nome do restaurante';
        input.maxLength = 100;
        input.pattern = '^(?!.*[\\/]).+$';
        input.title = "O nome não pode conter '/' ou '\\'";
        input.required = true;
        flex.appendChild(input);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('btn', 'btn-outline-danger', 'btn-sm');
        btn.textContent = 'Remover';
        btn.addEventListener('click', () => removeRestaurant(btn));
        flex.appendChild(btn);

        div.appendChild(flex);
        return div;
    }
  
    /**
     * Adiciona bloco e incrementa índice.
     * Exposto global porque o HTML chama onclick="addRestaurant()".
     */
    window.addRestaurant = function() {
        const block = createRestaurantBlock(nextIndex);
        container.appendChild(block);
        nextIndex++;
    };
  
    /**
     * Remove o bloco pai do botão.
     */
    window.removeRestaurant = function(btn) {
        const grp = btn.closest('.form-group');
        
        if (grp) {
            grp.remove();
        }
        
        // Se retiraste tudo e continuas Dono, podes garantir 1 bloco:
        if (prioritySelect.value === 'Dono' && container.children.length === 0) {
            addRestaurant();
        }
    };
  
    /**
     * Mostra ou esconde o wrapper de restaurantes
     * e, em Dono, garante pelo menos 1 bloco.
     */
    function handlePriorityChange() {
        if (prioritySelect.value === 'Dono') {
            wrapper.style.display = 'block';
            if (container.children.length === 0) {
                addRestaurant();
            }
        } else {
            wrapper.style.display = 'none';
            // limpa tudo quando não for Dono
            container.innerHTML = '';
            nextIndex = 0;
        }
    }
  
    handlePriorityChange();

    prioritySelect.addEventListener('change', handlePriorityChange);
});
  