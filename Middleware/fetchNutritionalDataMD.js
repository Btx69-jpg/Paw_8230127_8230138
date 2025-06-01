const axios = require("axios");
const NodeCache = require("node-cache");
const nutritionCache = new NodeCache({ stdTTL: 3600 });

async function fetchNutritionalData(ingredient, type) {
  const cacheKey = `${type}:${ingredient}`;
  const cached = nutritionCache.get(cacheKey);
  if (cached) return cached;

  let product;
  if (type === "barcode") {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${ingredient}.json`,
      { timeout: 120000 }
    );
    product = response.data.product;
  } else {
    const response = await axios.get(
      "https://world.openfoodfacts.org/cgi/search.pl",
      {
        params: { search_terms: ingredient, page_size: 1, json: 1 },
        timeout: 120000
      }
    );
    product = response.data.products?.[0];
  }

  if (!product || !product.nutriments) return null;

  const result = {
    name: product.product_name || ingredient,
    per100g: {
      calories: product.nutriments["energy-kcal_100g"] || 0,
      protein: product.nutriments.proteins_100g || 0,
      fat: product.nutriments.fat_100g || 0,
      carbohydrates: product.nutriments.carbohydrates_100g || 0,
      sugars: product.nutriments.sugars_100g || 0
    }
  };

  nutritionCache.set(cacheKey, result);
  return result;
}

module.exports = {
  fetchNutritionalData
};