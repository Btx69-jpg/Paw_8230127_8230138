const axios = require('axios');

async function validarMorada(street, postal_code, city) {
  const fullAddress = `${street}, ${postal_code} ${city}, Portugal`;

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        street: street,
        city: city,
        postalcode: postal_code,
        country: 'Portugal',
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'Restaurantes/1.0 (willkie79@gmail.com)'
      }
    });

    if (response.data.length === 0) {
      return { valido: false, error: 'Morada não encontrada. Verifica os dados introduzidos.' };
    }

    const place = response.data[0];

    return {
      valido: true,
      moradaFormatada: place.display_name,
      lat: place.lat,
      lon: place.lon,
      fullAddress
    };
  } catch (err) {
    console.error('Erro na API Nominatim:', err);
    return { valido: false, error: 'Erro ao validar morada. Tenta novamente mais tarde.' };
  }
}

/**
 * * Calcular a distancia enter duas coordeanads através da formula de Haversine
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const toRad = angle => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function verificarDistancia(morada1, morada2, limiteKm) {
  const resultado1 = await validarMorada(morada1.street, morada1.postal_code, morada1.city);
  const resultado2 = await validarMorada(morada2.street, morada2.postal_code, morada2.city);

  if (!resultado1.valido || !resultado2.valido) {
    return { dentroDoLimite: false, error: 'Uma das moradas é inválida' };
  }

  const distancia = calcularDistancia(parseFloat(resultado1.lat), parseFloat(resultado1.lon),
                                      parseFloat(resultado2.lat), parseFloat(resultado2.lon));

  let dentroLimite = false;

  if(distancia <= limiteKm) {
    dentroLimite = true;
  }

  return {
    dentroDoLimite: dentroLimite,
    distanciaKm: distancia.toFixed(2)
  };
}


module.exports = { 
  validarMorada,
  verificarDistancia
};