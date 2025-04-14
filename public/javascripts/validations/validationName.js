function handleInvalidInput(input) {
    if (!input.value) {
      input.setCustomValidity('Campo obrigatório!');
    } else {
      input.setCustomValidity('Por favor, insira apenas letras e espaços.');
    }
}