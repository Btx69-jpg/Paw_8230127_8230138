function inputDono() {
    const valueSelectBox = document.getElementById('priority').value;
    const restaurantsWrapper = document.getElementById('restaurantsWrapper');
  
    if (valueSelectBox === 'Dono') {
        restaurantsWrapper.style.display = 'block';
    } else {
        restaurantsWrapper.style.display = 'none';
    }
}