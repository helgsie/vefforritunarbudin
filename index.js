import { empty, el } from './lib/elements.js';
import { renderProducts, renderCategories, renderHeader, searchAndRender, renderProductPage, renderCategoryPage, renderButton } from './lib/ui.js';

async function onSearch(e, context) {
  e.preventDefault();

  if (!e.target || !(e.target instanceof Element)) return;

  const { value } = e.target.querySelector('input') ?? {};

  if (!value) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const products = params.get('products');

  if (context === 'category' && category) {
    const categoryUrl = `/products?category=${category}&search=${value}`;
    await searchAndRender(document.body, e.target, value, 'category');
    window.history.pushState({}, '', categoryUrl);
  } else if (context === 'products' && products) {
    const productsUrl = `/?products=all&offset=0&limit=100&search=${value}`;
    await searchAndRender(document.body, e.target, value, 'products');
    window.history.pushState({}, '', productsUrl);
  }
}

function route() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const category = params.get('category');
  const categories = params.get('categories');
  const products = params.get('products');

  const limit = parseInt(params.get('limit') ?? '12', 10);
  const offset = parseInt(params.get('offset') ?? '0', 10);

  const mainElement = el('main', { class:'main', id:'efni' });

  renderHeader(document.body);
  document.body.appendChild(mainElement);

  if (categories) {
    renderCategories(mainElement);
  } else if (products) {
    renderProducts(mainElement, limit, category, 'Allar vörur', offset)
  } else if (id) {
    renderProductPage(mainElement, id);
  } else if (category) {
    renderCategoryPage(mainElement, category, limit, onSearch);
  } else {
    renderProducts(mainElement, 6, category, 'Nýjar vörur')
      .then(() => renderButton(mainElement))
      .then(() => renderCategories(mainElement))
      .catch(error => console.error("Villa við birtingu á vörum", error));
  }
}

// Bregst við því þegar við notum vafra til að fara til baka eða áfram.
window.onpopstate = () => {
  empty(document.body);
  route();
};

// Athugum í byrjun hvað eigi að birta.
route();