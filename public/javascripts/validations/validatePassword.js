function validatePassword() {
    var password = document.getElementById('password');
    var confirmPassword = document.getElementById('confirmPassword');

    if (confirmPassword.value !== password.value) {
      // Define mensagem customizada se não forem iguais
      confirmPassword.setCustomValidity('As passwords não coincidem.');
    } else {
      // Remove a mensagem se forem iguais
      confirmPassword.setCustomValidity('');
    }
}