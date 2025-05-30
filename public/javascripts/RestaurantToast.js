      // Conecte ao servidor Socket.IO
      const socket = io();

      // Substitua pelo identificador do restaurante se necessário
      const userElement = document.getElementById("user-data");
      if (userElement && userElement.dataset.user) {
        user = JSON.parse(userElement.dataset.user);
      }
      const restaurantName = user._id;
      // Junte-se à sala do restaurante para receber eventos só desse restaurante
      socket.emit("joinRestaurantRoom", restaurantName);

      // Escute o evento de nova ordem
      socket.on("newOrder", function (order) {
        // Mostra o toast Bootstrap
        const toastEl = document.getElementById("newOrderToast");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      });