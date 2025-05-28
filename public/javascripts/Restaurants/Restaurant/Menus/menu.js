document.addEventListener("DOMContentLoaded", function () {
  const flipButtons = document.querySelectorAll(".flip-card-btn");

  flipButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = button.closest(".dish-card");
      card.classList.toggle("flipped");
    });
  });
});