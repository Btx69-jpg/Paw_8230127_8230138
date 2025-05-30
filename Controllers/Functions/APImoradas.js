const axios = require('axios');

async function validarMorada(street, postal_code, city) {
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

module.exports = { validarMorada };