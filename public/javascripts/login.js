//Conectar um usuário
/* 
Depois de fazer login de um usuário com o Google usando os escopos padrão, você pode 
acessar o ID do Google, o nome, o URL do perfil e o endereço de e-mail do usuário.

Para extrair informações de perfil de um usuário, use o método getBasicProfile().
*/
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}
//Desconectar um usuário
/*
É possível permitir que os usuários saiam do app sem sair do Google adicionando 
um botão ou link de desativação ao seu site. Para criar um link de desativação, 
anexe uma função que chame o método GoogleAuth.signOut() ao evento onclick do link.
*/
function signOut() {
var auth2 = gapi.auth2.getAuthInstance();
auth2.signOut().then(function () {
    console.log('User signed out.');
});
}