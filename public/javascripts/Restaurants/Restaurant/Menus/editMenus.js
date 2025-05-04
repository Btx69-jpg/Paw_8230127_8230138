// Função para adicionar porção (funciona tanto para pratos existentes quanto para novos)
function addPortion(selectElement) {
  const index = selectElement.dataset.index;
  const container = document.getElementById(`portionsContainer-${index}`);
  const portionId = selectElement.value;
  if (!portionId) return;
  const portionName = selectElement.options[selectElement.selectedIndex].text;

  // Define o prefixo do nome conforme se é prato existente ou novo
  const isNew = (String(index).startsWith("new-"));
  const namePrefix = isNew ? `newDishes[${index.split('-')[1]}]` : `dishes[${index}]`;

  // Verifica se a porção já foi adicionada no prato
  if (container.querySelector(`input[name^="${namePrefix}[portions]"][value="${portionId}"]`)) {
    alert("Esta porção já foi adicionada");
    return;
  }

  // Cria o item de porção com o campo de preço obrigatório
  const div = document.createElement("div");
  div.className = "portion-item";
  div.innerHTML = `
    <div class="portion-content">
      <input type="hidden" name="${namePrefix}[portions][]" value="${portionId}">
      <span>${portionName}</span>
      <input type="number" class="form-control" name="${namePrefix}[portionPrices][]" placeholder="Preço" min="0" step="0.01" required>
    </div>
    <span class="remove-portion" onclick="removePortion(this)">✕</span>
  `;
  container.appendChild(div);

  // Oculta a opção selecionada no dropdown para evitar duplicidade
  selectElement.options[selectElement.selectedIndex].style.display = 'none';
  selectElement.value = "";

  validatePortions(index);
}

// Função para remover porção e reexibir a opção no dropdown
function removePortion(element) {
  const portionItem = element.closest(".portion-item");
  const container = portionItem.closest(".portions-container");
  const portionId = portionItem.querySelector('input[type="hidden"]').value;
  const index = container.dataset.index;
  const selectElement = document.getElementById(`portionSelect-${index}`);
  Array.from(selectElement.options).forEach(option => {
    if (option.value === portionId) {
      option.style.display = '';
    }
  });
  portionItem.remove();
  validatePortions(index);
}

// Validação para garantir que ao menos uma porção seja selecionada
function validatePortions(index) {
  const container = document.getElementById(`portionsContainer-${index}`);
  const error = container.closest(".mb-3").querySelector(".portion-error");
  error.style.display = container.children.length === 0 ? "block" : "none";
}

// Função para adicionar novos pratos (inclui área de porções dinâmica)
let newDishIndex = 0;
function addNewDishField() {
  const container = document.getElementById('newDishesContainer');
  const dishDiv = document.createElement('div');
  dishDiv.className = 'dish-card mb-3';
  dishDiv.innerHTML = `
    <h6>Novo Prato ${newDishIndex + 1}</h6>
    <div class="mb-3">
      <label class="form-label">Nome:</label>
      <input type="text" name="newDishes[${newDishIndex}][name]" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Imagem:</label>
      <input type="file" name="newDishes[${newDishIndex}][photo]" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Descrição:</label>
      <textarea name="newDishes[${newDishIndex}][description]" class="form-control" rows="2" required></textarea>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Categoria:</label>
        <select name="newDishes[${newDishIndex}][category]" class="form-select" required>
          <% categories.forEach(function(cat) { %>
            <option value="<%= cat.category %>"><%= cat.category %></option>
          <% }); %>
        </select>
      </div>
    </div>
    <!-- Seção de Porções para o novo prato -->
    <div class="mb-3">
      <label class="form-label">Porções:</label>
      <div id="portionsContainer-new-${newDishIndex}" class="portions-container mb-3" data-index="new-${newDishIndex}"></div>
      <div class="input-group">
        <select id="portionSelect-new-${newDishIndex}" class="form-select portion-select" data-index="new-${newDishIndex}" onchange="addPortion(this)">
<option value="">Selecione uma porção...</option>
              <% portions.forEach(function(portion) { %>
              <option value="<%= portion._id %>">
                <%= portion.portion %>
              </option>
              <% }); %>
        </select>
        <button type="button" class="btn btn-outline-secondary" onclick="addPortion(document.getElementById('portionSelect-new-${newDishIndex}'))">
          Adicionar
        </button>
      </div>
      <small class="text-danger portion-error" style="display: none">
        Pelo menos uma porção é obrigatória.
      </small>
    </div>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
      Remover
    </button>
  `;
  container.appendChild(dishDiv);
  newDishIndex++;
}

