import { getProduct, searchProducts, searchProductsInCategory, fetchProducts, fetchCategories } from './api.js';
import { el } from './elements.js';

/**
 * Setur „loading state“ skilaboð meðan gögn eru sótt eða lætur þau hverfa.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt/óvirkt.
 */
function toggleLoading(parentElement, isLoading, searchForm = undefined) {
  let loadingElement = parentElement.querySelector('.loading');

  if (isLoading) {
    if (!loadingElement) {
        loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
        parentElement.appendChild(loadingElement);
    }
    if (searchForm) {
        const button = searchForm.querySelector('button');
        if (button) button.setAttribute('disabled', 'disabled');
    }
  } else {
    if (loadingElement) loadingElement.remove();
    if (searchForm) {
        const disabledButton = searchForm.querySelector('button[disabled]');
        if (disabledButton) disabledButton.removeAttribute('disabled');
    }
  }
}
/**
 * Býr til card element fyrir vöru.
 * @param {*} product Gögn um vöruna.
 * @returns Card element.
 */
function createCard(product) {
    const card = el('div',{ class: 'card' },
                    el('a', { href: `?id=${product.id}` },
                        el('img', { src: `${product.images[0]}`, alt: ''})
                    ),
                    el('div', { class: 'card-info' },
                        el('div', { class:'card-text'},
                            el('a', { href: `/products/${product.category}` },
                                el('h3', {}, product.title)
                            ),
                            el('p', {}, product.category.charAt(0).toUpperCase() + product.category.slice(1))
                        ),
                        el('p', { class: 'price' }, `$${product.price}`)
                    )
                );
    return card;
}

export function createSearchResults(parentElement, results, query) {
    const list = el('div', { class: 'cards' });

    // Fjarlægjum fyrri niðurstöður
    const cardsElement = parentElement.querySelector('.cards');
    const paginationElement = parentElement.querySelector('.pagination');
    const resultTitleElement = parentElement.querySelector('.resultTitle');
    if (cardsElement) cardsElement.remove();
    if (paginationElement) paginationElement.remove();
    if (resultTitleElement) resultTitleElement.remove();

    const resultTitle = el('div', { class: 'resultTitle' }, 
        el('h2', {}, `Leitarniðurstöður fyrir „${query}“`)
    );
    parentElement.appendChild(resultTitle);

    if (!results) {
        // Villustaða
        list.appendChild(el('p', { class: 'result' }, 'Villa við að sækja gögn.'));
    } else if (results.length === 0) {
        // Tóm staða
        list.appendChild(el('p', { class: 'result' }, 'Ekkert fannst.'));
    } else {
        // Gagnastaða
        results.forEach(result => list.appendChild(createCard(result)));
    }
    parentElement.appendChild(list);
}

export async function searchAndRender(parentElement, searchForm, query, context) {
  // Fjarlægjum fyrri niðurstöður
  const resultsElement = parentElement.querySelector('.results');
  if (resultsElement) resultsElement.remove();

  // Ekki birta niðurstöður þegar leit hefur ekki verið framkvæmd
  if (!query || query.trim() === '') return;

  toggleLoading(parentElement, true, searchForm);
  try {
    let results;
    if (context === 'category') {
        const category = new URLSearchParams(window.location.search).get('category');
        results = await searchProductsInCategory(query, category);
    } else {
        results = await searchProducts(query);
    }
    toggleLoading(parentElement, false, searchForm);
    createSearchResults(parentElement, results, query);
  } catch (e) {
    console.error('Villa við að sækja gögn: ', e);
    parentElement.appendChild(el('p', {}, 'Villa við að sækja gögn.'));
    toggleLoading(parentElement, false, searchForm);
  }
}

export function renderHeader(parentElement) {
    const urlLimit = 100;
    const urlOffset = 0;

    const header = el('header', { class: 'header'}, 
        el('div', { class: 'header-content' }, 
            el('div', { class:'logo' }, 
                el('a', {href: '/'}, 
                    el('h1', {}, 'Vefforritunarbúðin')),
                el('p', { class:'sr-only' }, 
                    el('a', { href: '#efni'}, 'Beint í efni'))),
            el('nav', { class:'nav'}, 
                el('div', { class:'nav-sign-in' }, 
                    el('a', { href:'/' }, 'Nýskrá'),
                    el('a', { href:'/' }, 'Innskrá')),
                el('div', { class:'nav-cart' }, 
                    el('a', { href:'/' }, 'Karfa')),
                el('div', { class:'nav-products' }, 
                    el('a', { class:'nav-new-products', href:`/?products=all&offset=${urlOffset}&limit=${urlLimit}` }, 'Allar vörur'),
                    el('a', { id:'nav-categories', href:'/?categories=all' }, 'Flokkar')
                )
            )
        )
    );
    parentElement.appendChild(header);
}

export async function renderProducts(parentElement, limit, category, title, offset) {
    toggleLoading(parentElement, true);
    try {
        const results = await fetchProducts(limit, category, offset);
        toggleLoading(parentElement, false);
        const productSection = el(
            'div',
            { id: 'product-section' },
              el('h1', {}, title),
        );
        const params = new URLSearchParams(window.location.search);
        const products = params.get('products');
        if (products) {
            const searchForm = renderSearchForm(async (e) => {
                e.preventDefault();
                const query = e.target.querySelector('.search').value;
                await searchAndRender(parentElement, searchForm, query);
            });
            productSection.appendChild(searchForm);
        }
        const cards = el('section', { class: 'cards' });
        productSection.appendChild(cards);
        results.forEach(result => cards.appendChild(createCard(result)));
        parentElement.appendChild(productSection);
    } catch (e) {
        console.error('Villa við að sækja gögn: ', e);
        parentElement.appendChild(el('p', {}, 'Villa við að sækja gögn um vöru!'));
        toggleLoading(parentElement, false);
    }
}

export async function renderButton(parentElement) {
    const button = el('a', { href: '/?categories=all' }, 
        el('button', { class: 'button' }, 'Skoða alla flokka'));
    parentElement.appendChild(button);
}

export async function renderCategories(parentElement) {
    toggleLoading(parentElement, true);
    try {
        const results = await fetchCategories();
        toggleLoading(parentElement, false);
        const categorySection = el('div', { id: 'category-section' },
            el('h2', {}, 'Skoðaðu vöruflokkana okkar'));
        const categories = el('div', { class: 'categories' });
        categorySection.appendChild(categories);
        results.forEach(result => {
            const category = el('div', { class: 'category' },
                el('a', { href: `/?category=${result.slug}`}, 
                    el('p', { class: `${result.name}` }, result.name)
                )
            );
            categories.appendChild(category);
        });
        parentElement.appendChild(categorySection);
    } catch (e) {
        console.error('Villa við að sækja gögn: ', e);
        parentElement.appendChild(el('p', {}, 'Villa við að sækja gögn um vöru!'));
        toggleLoading(parentElement, false);
    }
}

export async function renderProductPage(container, id) {
    toggleLoading(container, true);
    try {
        const result = await getProduct(id);
        toggleLoading(container, false);
        const category = result.category ? result.category.charAt(0).toUpperCase() + result.category.slice(1) : 'Óþekktur flokkur';
    
        const productDisplay = el('div', { class: 'product-display' },
            el('img', { src:`${result.images[0]}`, alt: '' }),
            el('div', { class:'product-info' }, 
                el('h2', {}, result.title),
                el('p', {}, `Flokkur: ${category}`),
                el('p', {}, `Verð: $${result.price}`),
                el('p', {}, result.description)
            )
        );
        container.appendChild(productDisplay);

        const productSection = 
        el('div', { class: 'product-section' },
            el('h1', {}, `Meira úr ${result.category.charAt(0).toUpperCase() + result.category.slice(1)}`)
        );

        const cards = el('section', { class: 'cards' });
        productSection.appendChild(cards);
        container.appendChild(productSection);

        const products = await fetchProducts(3, result.category_id);
        products.forEach(product => cards.appendChild(createCard(product)));
    } catch (e) {
        console.error('Villa við að sækja gögn: ', e);
        container.appendChild(el('p', {}, 'Villa við að sækja gögn um vöru!'));
        toggleLoading(container, false);
    }
}

export function renderSearchForm(searchHandler, query = '') {
    const label = el('label', { for: 'search' }, 'Leita:');
    const search = el('input', {
        type: 'search',
        placeholder: 'Leitarorð',
        value: query,
        class: 'search'
    });
    const button = el('button', { class:'search-button'}, 'Leita');
    const container = el('form', { class: 'search-bar' }, label, search, button);
    container.addEventListener('submit', searchHandler);
    return container;
}

export function renderPagination(container, category, limit) {
    let offset = 0;

    const buttonLeft = el('button', { class:'button-left' }, 'Fyrri síða');
    const buttonRight = el('button', { class: 'button-right' }, 'Næsta síða');
    const pagination = el('div', { class: 'pagination' }, buttonLeft, buttonRight);

    buttonLeft.addEventListener('click', async () => {
        offset = Math.max(0, offset - limit);
        await renderProducts(container, limit, category, 'Allar vörur', offset);
    });
    
    buttonRight.addEventListener('click', async () => {
        offset += limit;
        await renderProducts(container, limit, category, 'Allar vörur', offset);
    });

    container.appendChild(pagination);
}

export async function renderCategoryPage(parentElement, category, limit, onSearch, searchHandler, query) {
    toggleLoading(parentElement, true);
    try {
        const results = await fetchProducts(limit, category);
        toggleLoading(parentElement, false);

        const productSection = el('div', { class: 'product-section' },
            el('h1', {}, results[0].category.charAt(0).toUpperCase() + results[0].category.slice(1))
        );
        const params = new URLSearchParams(window.location.search);
        const categories = params.get('category');
        if (categories) {
            const searchForm = renderSearchForm(async (e) => {
                e.preventDefault();
                const query = e.target.querySelector('.search').value;
                await searchAndRender(parentElement, searchForm, query, 'category');
            });
            productSection.appendChild(searchForm);
        }
        const cards = el('section', { class: 'cards' });
        productSection.appendChild(cards);
        results.forEach(result => cards.appendChild(createCard(result)));
        parentElement.appendChild(productSection);

        const buttonLeft = el('button', { class:'button-left' }, 'Fyrri flokkur');
        const buttonRight = el('button', { class: 'button-right' }, 'Næsti flokkur');
        const pagination = el('div', { class: 'pagination' }, buttonLeft, buttonRight);

        buttonLeft.addEventListener('click', () => changeCategory(-1, parentElement, category, limit, searchHandler, query));
        buttonRight.addEventListener('click', () => changeCategory(1, parentElement, category, limit, searchHandler, query));

        parentElement.appendChild(pagination);
    } catch (e) {
        console.error('Villa við að sækja gögn: ', e);
        parentElement.appendChild(el('p', {}, 'Villa við að sækja gögn um vöru!'));
        toggleLoading(parentElement, false);
    }
}

async function changeCategory(direction, parentElement, currentCategorySlug, limit, searchHandler, query) {
    // Fjarlægjum fyrri niðurstöður
    const productsElement = parentElement.querySelector('.product-section');
    const paginationElement = parentElement.querySelector('.pagination');
    if (productsElement) productsElement.remove();
    if (paginationElement) paginationElement.remove();

    const categories = await fetchCategories();
    const currentIndex = categories.findIndex((cat) => cat.slug === currentCategorySlug);
    let newIndex = currentIndex + direction;

    // Pössum að indexið haldist innan marka
    if (newIndex < 0) {
        newIndex = categories.length - 1;
    } else if (newIndex >= categories.length) {
        newIndex = 0;
    }
    const newCategory = categories[newIndex];

    // Uppfærum URL-ið
    const newUrl = `?category=${newCategory.slug}`;
    window.history.pushState({}, '', newUrl);

    // Endurhlöðum flokkasíðuna með nýja flokkinn
    renderCategoryPage(parentElement, newCategory.slug, limit, searchHandler, query);
}
