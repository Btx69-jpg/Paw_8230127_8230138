// Conecte ao servidor Socket.IO
const socket = io();

// Substitua pelo identificador do restaurante se necessário
const userElement = document.getElementById("user-data");
if (userElement && userElement.dataset.user) {
  try {
    const user = JSON.parse(userElement.dataset.user);

    if (user && user._id) {
      const restaurantName = user._id;

      // Junte-se à sala do restaurante
      socket.emit("joinRestaurantRoom", restaurantName);

      // Escute o evento de nova ordem
      socket.on("newOrder", function (order) {
        const toastEl = document.getElementById("newOrderToast");
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      });
    } else {
      console.error("Erro: user._id está indefinido.");
    }
  } catch (err) {
    console.error("Erro ao fazer parse de user-data:", err);
  }
} else {
  console.error("Elemento com id 'user-data' não encontrado ou sem data-user.");
}