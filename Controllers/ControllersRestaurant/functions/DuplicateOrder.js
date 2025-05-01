function sameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth()    === d2.getMonth() &&
      d1.getDate()     === d2.getDate()
    );
  }
  
function sameClient(orderAt, order) {
    return (orderAt.firstName === order.firstName && orderAt.lastName === order.lastName &&
        orderAt.phoneNumber === order.phoneNumber && orderAt.email === order.email);
}
  
function sameRestaurant(orderAt, order) {
    return (orderAt.name === order.name && orderAt.phoneNumber === order.phoneNumber 
        && orderAt.email === order.email);
}
  
function sameAddress(orderAt, order) {
    return (orderAt.street === order.street && orderAt.postal_code === order.postal_code 
        && orderAt.city === order.city);
}
  
function sameItems(listAt, listOrder) {
    let equals = true;
    let i = 0;

    if(listAt.length !== listOrder.length) {
        equals = false;
    }
    while (i < listAt.length && equals) { 
        const itemAt = listAt[i];
        const itemOrd = listOrder[i];
        
        if (itemAt.item !== itemOrd.item) {
            equals = false;
        } else if(itemAt.item === itemOrd.item) {
            if (itemAt.portion !== itemOrd.portion) {
                equals = false;
            } else if (itemAt.portion === itemOrd.portion && itemAt.quantity !== itemOrd.quantity) {
                equals = false;
            }
        }
        i++;
    }
   
    return equals;
}
  
function duplicateOrder(orders, order) {
    let i = 0;
    let found = false;
    while (i < orders.length && !found) {
        const orderAt = orders[i];
        
        if (orderAt._id.toString() === order._id.toString() || (
            (sameDay(orderAt.date, order.date) && orderAt.type === order.type
            && orderAt.status === order.status) && sameClient(orderAt.client, order.client) 
            && sameRestaurant(orderAt.restaurant, order.restaurant) 
            && sameAddress(orderAt.addressOrder, order.addressOrder) && sameItems(orderAt.itens, order.itens)
        )) {
            found = true;
        } else {
            i++;
        }
    }
    
    return found;
}

module.exports = {
    sameDay,
    sameClient,
    sameRestaurant,
    sameAddress,
    sameItems,
    duplicateOrder,
}