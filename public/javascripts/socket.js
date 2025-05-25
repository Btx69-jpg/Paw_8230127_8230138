const socket = io('http://localhost:3000');

document.addEventListener("DOMContentLoaded", function () {
  const userId = document.body.getAttribute('data-userid');
  socket.emit('register', userId);

  socket.on('toast', (message) => {
    toastr.options = {
      closeButton: true,
      progressBar: true,
      timeOut: 3000
    };
    toastr.info(message);
  });
});
