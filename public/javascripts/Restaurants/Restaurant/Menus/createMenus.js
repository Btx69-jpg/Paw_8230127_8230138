let dishIndex = 1; // O primeiro formulário já está indexado como 0

      document
        .getElementById("addDishBtn")
        .addEventListener("click", function () {
          if (dishIndex >= 10) {
            alert("O máximo de pratos é 10.");
            return;
          }
          const container = document.getElementById("dishesContainer");
          const newDish = document.createElement("div");
          newDish.classList.add("dish-form", "border", "p-3", "mb-3");
          newDish.setAttribute("data-index", dishIndex);
          // Para pratos adicionais, a categoria é de livre escrita (ou pode ser alterado conforme a lógica desejada)
          newDish.innerHTML = `
          <h5>Prato ${dishIndex + 1}</h5>
          <div class="mb-3">
            <label for="dishName${dishIndex}" class="form-label">Nome:</label>
            <input type="text" name="dishes[${dishIndex}][name]" id="dishName${dishIndex}" class="form-control" placeholder="Nome do prato" required maxlength="50" pattern="^[A-Za-zÀ-ÿ\s]+$">
          </div>
          <div class="mb-3">
            <label for="dishDescription${dishIndex}" class="form-label">Descrição:</label>
            <input type="text" name="dishes[${dishIndex}][description]" id="dishDescription${dishIndex}" class="form-control" placeholder="Descrição do prato" required maxlength="250">
          </div>
          <% if (categories && categories.length > 0) { %>
            <div class="mb-3">
              <label for="dishCategory${dishIndex}" class="form-label">Categoria:</label>
              <select name="dishes[${dishIndex}][category]" id="dishCategory${dishIndex}" class="form-select" required>
                <% categories.forEach(function(cat) { %>
                  <option value="<%= cat.category %>"><%= cat.category %></option>
                <% }); %>
              </select>
            </div>
          <% } else { %>
            <div class="mb-3">
              <label for="dishCategory${dishIndex}" class="form-label">Categoria:</label>
              <input type="text" name="dishes[${dishIndex}][category]" id="dishCategory${dishIndex}" class="form-control" required>
            </div>
          <% } %>
          <div class="mb-3">
            <label for="dishPrice${dishIndex}" class="form-label">Preço:</label>
            <input type="number" name="dishes[${dishIndex}][price]" id="dishPrice${dishIndex}" class="form-control" placeholder="Preço do prato" required min="0" step="0.01">
          </div>

          <div class="mb-3">
  <label class="form-label">Ingredientes:</label>
  <div id="ingredientsContainer-${dishIndex}">
    <div class="ingredient-item mb-2">
      <div class="input-group">
        <select class="form-select search-type" style="max-width: 150px;">
          <option value="name">Por Nome</option>
          <option value="barcode">Por Código</option>
        </select>
        <input
          type="text"
          name="dishes[${dishIndex}][ingredients][]"
          class="form-control ingredient-input"
          placeholder="Nome do ingrediente"
          required
        />
        <button type="button" class="btn btn-outline-danger remove-ingredient">×</button>
      </div>
    </div>
  </div>
  <button type="button" class="btn btn-sm btn-secondary add-ingredient">Adicionar Ingrediente</button>
  <small class="text-muted">Use vírgulas para múltiplos itens ou códigos de barras</small>
</div>

          <div class="mb-3">
            <label class="form-label">Porções:</label>
            <div id="portionsContainer-${dishIndex}" class="portions-container mb-3" data-index="${dishIndex}"></div>
            <div class="input-group">
              <select 
                id="portionSelect-${dishIndex}" 
                class="form-select portion-select"
                data-index="${dishIndex}"
                onchange="addPortion(this)"
              >
<option value="">Selecione uma porção...</option>
                  <% portions.forEach(function(portion) { %>
                  <option value="<%= portion._id %>">
                    <%= portion.portion %>
                  </option>
                  <% }); %>
                </select>
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                onclick="addPortion(document.getElementById('portionSelect-${dishIndex}'))"
              >
                Adicionar
              </button>
            </div>
            <small class="text-danger portion-error" style="display: none">
              Pelo menos uma porção é obrigatória
            </small>
          </div>
          <div class="mb-3">
            <label for="dishPhoto${dishIndex}" class="form-label">Foto do Prato:</label>
            <input type="file" accept="image/*" name="dishes[${dishIndex}][photo]" id="dishPhoto${dishIndex}" class="form-control" required>
          </div>
          <div class="mb-3">
            <button type="button" class="btn btn-danger removeDishBtn">Remover Prato</button>
          </div>
        `;
          container.appendChild(newDish);
          dishIndex++;
        });

      document
        .getElementById("dishesContainer")
        .addEventListener("click", function (e) {
          if (e.target && e.target.classList.contains("removeDishBtn")) {
            // Garante que haja pelo menos um prato (o primeiro não pode ser removido)
            if (document.querySelectorAll(".dish-form").length > 1) {
              e.target.closest(".dish-form").remove();
              reindexDishes();
            } else {
              alert("Você precisa ter pelo menos um prato no menu.");
            }
          }
        });

      function reindexDishes() {
        const dishForms = document.querySelectorAll(".dish-form");
        dishForms.forEach((form, index) => {
          form.setAttribute("data-index", index);
          const header = form.querySelector("h5");
          header.innerText = `Prato ${index + 1}`;

          const elements = form.querySelectorAll("input, select, label");
          elements.forEach((el) => {
            if (
              (el.tagName.toLowerCase() === "input" ||
                el.tagName.toLowerCase() === "select") &&
              el.hasAttribute("name")
            ) {
              let nome = el.getAttribute("name");
              nome = nome.replace(/dishes\[\d+\]/, `dishes[${index}]`);
              el.setAttribute("name", nome);
            }
            if (el.hasAttribute("id")) {
              let novoId = el.getAttribute("id").replace(/\d+$/, index);
              el.setAttribute("id", novoId);
            }
            if (
              el.tagName.toLowerCase() === "label" &&
              el.hasAttribute("for")
            ) {
              let novoFor = el.getAttribute("for").replace(/\d+$/, index);
              el.setAttribute("for", novoFor);
            }
          });
        });
        dishIndex = dishForms.length;
      }

      // Atualiza o required do input de preço conforme seleção de checkbox (caso necessário para outra lógica)
      document.addEventListener("DOMContentLoaded", function () {
        document.body.addEventListener("change", function (e) {
          if (e.target.classList.contains("portion-checkbox")) {
            const priceInput = e.target
              .closest(".form-check")
              .querySelector(".portion-price");
            priceInput.disabled = !e.target.checked;
            if (e.target.checked) {
              priceInput.required = true;
            } else {
              priceInput.required = false;
              priceInput.value = "";
            }
          }
        });
      });

      // Função para adicionar porção
      function addPortion(selectElement) {
        const index = selectElement.dataset.index;
        const container = document.getElementById(`portionsContainer-${index}`);
        const portionId = selectElement.value;
        if (!portionId) return;
        const portionName =
          selectElement.options[selectElement.selectedIndex].text;

        // Verifica se a porção já foi adicionada
        if (
          document.querySelector(
            `input[name^="dishes[${index}][portions]"][value="${portionId}"]`
          )
        ) {
          alert("Esta porção já foi adicionada");
          return;
        }

        // Adiciona a porção com o campo de preço obrigatório
        const div = document.createElement("div");
        div.className = "portion-item";
        div.innerHTML = `
          <div class="portion-content">
            <input type="hidden" name="dishes[${index}][portions][]" value="${portionId}">
            <span>${portionName}</span>
            <input type="number" class="form-control" name="dishes[${index}][portionPrices][]" placeholder="Preço" min="0" step="0.01" required>
          </div>
          <span class="remove-portion" onclick="removePortion(this)">✕</span>
        `;
        container.appendChild(div);

        // Ao invés de desabilitar a opção, oculta-a do dropdown para que não seja visível
        selectElement.options[selectElement.selectedIndex].style.display =
          "none";
        selectElement.value = "";
        validatePortions(index);
      }

      function removePortion(element) {
        const portionItem = element.closest(".portion-item");
        const container = portionItem.closest(".portions-container");
        const portionId = portionItem.querySelector(
          'input[type="hidden"]'
        ).value;
        const containerIndex = container.dataset.index;
        const selectElement = document.getElementById(
          `portionSelect-${containerIndex}`
        );

        // Restaura a opção removida para que volte a ser exibida
        Array.from(selectElement.options).forEach((option) => {
          if (option.value === portionId) {
            option.style.display = "";
          }
        });
        portionItem.remove();
        validatePortions(containerIndex);
      }

      // Validação para garantir que ao menos uma porção seja adicionada por prato
      function validatePortions(index) {
        const container = document.getElementById(`portionsContainer-${index}`);
        const error = container
          .closest(".mb-3")
          .querySelector(".portion-error");
        error.style.display =
          container.children.length === 0 ? "block" : "none";
      }

      // Gerenciamento de ingredientes
      document.querySelectorAll(".add-ingredient").forEach((button) => {
        button.addEventListener("click", function () {
          const container = this.previousElementSibling;
          const newItem = document.createElement("div");
          newItem.className = "ingredient-item mb-2";
          newItem.innerHTML = `
      <div class="input-group">
        <select class="form-select search-type" style="max-width: 150px;">
          <option value="name">Por Nome</option>
          <option value="barcode">Por Código</option>
        </select>
        <input
          type="text"
          name="${container.firstElementChild.querySelector("input").name}"
          class="form-control ingredient-input"
          placeholder="Nome do ingrediente"
          required
        />
        <button type="button" class="btn btn-outline-danger remove-ingredient">×</button>
      </div>
    `;
          container.appendChild(newItem);
        });
      });

      document.body.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-ingredient")) {
          const container = e.target.closest("#ingredientsContainer-0"); // Ajuste o índice conforme necessário
          if (container.children.length > 1) {
            e.target.closest(".ingredient-item").remove();
          }
        }
      });

      // Validação de código de barras
      document.querySelectorAll(".ingredient-input").forEach((input) => {
        input.addEventListener("blur", function () {
          if (this.closest(".search-type").value === "barcode") {
            if (!/^\d{8,13}$/.test(this.value)) {
              alert("Código de barras inválido! Deve conter 8-13 dígitos");
              this.focus();
            }
          }
        });
      });