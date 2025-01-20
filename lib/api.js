/** Slóðir á API */
const API_URL = 'https://dummyjson.com/';
const PRODUCTS_ENDPOINT = 'products';
const CATEGORIES_ENDPOINT = 'products/categories';
const SEARCH_ENDPOINT = 'products/search';

async function fetchData(url) {
  let response;
  try {
    response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fékk ekki 200 status frá API: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.error('Villa við að sækja gögn:', e);
    return null;
  }
}

export async function fetchProducts(limit, category, offset) {
  const url = new URL(PRODUCTS_ENDPOINT, API_URL);
  if (limit) url.searchParams.set('limit', limit);
  if (offset) url.searchParams.set('skip', offset);
  if (category) url.pathname = `${PRODUCTS_ENDPOINT}/category/${category}`;

  const data = await fetchData(url);
  return data ? data.products : [];
}   

export async function fetchCategories() {
  const url = new URL(CATEGORIES_ENDPOINT, API_URL);
  const data = await fetchData(url);
  return data || [];
}   

export async function searchProducts(query) {
  const url = new URL(SEARCH_ENDPOINT, API_URL);
  url.searchParams.set('q', query);
  const data = await fetchData(url);
  return data ? data.products : [];
}

export async function searchProductsInCategory(query, category) {
  const url = new URL(`products/category/${category}`, API_URL);
  url.searchParams.set('q', query);

  const data = await fetchData(url);
  console.log("data: " + data + "data extra: " + data.products.filter(product => product.title.toLowerCase().includes(query.toLowerCase())));
  console.log("hæ");
  if (!data) return [];
  return data.products.filter(product => product.title.toLowerCase().includes(query.toLowerCase()));
}

export async function getProduct(id) {
  const url = new URL(`${PRODUCTS_ENDPOINT}/${id}`, API_URL);
  return await fetchData(url);
}