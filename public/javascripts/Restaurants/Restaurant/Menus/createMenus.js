let dishIndex = 1; // O primeiro formulário já está indexado como 0

      

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
        <button  class="btn btn-danger remove-ingredient">
          <i class="bi bi-trash"></i>
        </button>
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