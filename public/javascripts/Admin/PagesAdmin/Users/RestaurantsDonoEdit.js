// /javascripts/Admin/PagesAdmin/Users/addRestaurantDono.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('restaurantsContainer');
    let nextIndex = parseInt(container.dataset.nextIndex, 10) || 0;
    const prioritySelect = document.getElementById('priority');
  
    /**
     * Cria e devolve um bloco completo de restaurante
     * (label em cima, depois input + botão “Remover” alinhados).
     */
    function createRestaurantBlock(index) {
      // Container do bloco
      const div = document.createElement('div');
      div.classList.add('form-group', 'mb-3');
      div.id = `divRestaurant-${index}`;
      div.dataset.index = index;
  
      // Label por cima
      const label = document.createElement('label');
      label.setAttribute('for', `restaurant-${index}`);
      label.textContent = 'Nome do restaurante';
      div.appendChild(label);
  
      // Flex wrapper para input + botão
      const flexWrapper = document.createElement('div');
      flexWrapper.classList.add('d-flex', 'align-items-center');
  
      // Input
      const input = document.createElement('input');
      input.type = 'text';
      input.classList.add('form-control', 'me-2');
      input.id = `restaurant-${index}`;
      input.name = `restaurant[${index}][name]`;
      input.placeholder = 'Introduza o nome do restaurante';
      input.maxLength = 100;
      input.pattern = '^(?!.*[\\/]).+$';
      input.title = "O nome não pode conter '/' ou '\\'";
      input.required = true;
      flexWrapper.appendChild(input);
  
      // Botão remover
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.classList.add('btn', 'btn-outline-danger', 'btn-sm');
      removeBtn.textContent = 'Remover';
      // Chamamos a função global removeRestaurant passando o próprio botão
      removeBtn.addEventListener('click', () => removeRestaurant(removeBtn));
      flexWrapper.appendChild(removeBtn);
  
      div.appendChild(flexWrapper);
      return div;
    }
  
    /**
     * Adiciona um novo bloco ao container.
     * Exposto em window para poder chamar inline no HTML.
     */
    window.addRestaurant = function() {
      const block = createRestaurantBlock(nextIndex);
      container.appendChild(block);
      nextIndex += 1;
    };
  
    /**
     * Remove o bloco pai do botão passado.
     * Exposto em window para poder chamar inline no HTML.
     */
    window.removeRestaurant = function(btn) {
      const group = btn.closest('.form-group');
      if (group) group.remove();
    };
  
    /**
     * Se estamos em “Dono” e não existe ainda nenhum bloco,
     * cria um logo de início.
     */
    function ensureAtLeastOne() {
      if (prioritySelect.value === 'Dono' && container.children.length === 0) {
        addRestaurant();
      }
    }
  
    // No carregamento inicial
    ensureAtLeastOne();
  
    // Quando o perfil muda para Dono, garante que aparece um bloco
    prioritySelect.addEventListener('change', ensureAtLeastOne);
  });
  