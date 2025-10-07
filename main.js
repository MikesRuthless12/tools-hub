const API = './tools.json';
const ITEMS_PER_PAGE = 24;
let allData = [];

let state = {
  type: 'All',
  tier: 0,
  category: '',
  query: '',
  languages: new Set(),
  platforms: new Set(),
  sortBy: 'default',
  currentPage: 1,
};

// --- DOM Element Cache ---
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
// ... (caching all other elements as before)
const { grid, catFilter, search, sortBy, themeToggle, visitorCountEl, langFilterContainer, priceFilterContainer, langFilters, paginationControls, resultsCountEl } = {
    grid: $('#grid'), catFilter: $('#catFilter'), search: $('#search'), sortBy: $('#sort-by'), themeToggle: $('#theme-toggle'), visitorCountEl: $('#visitor-count'),
    langFilterContainer: $('#lang-filter-container'), priceFilterContainer: $('#price-filter-container'), langFilters: $('#lang-filters'),
    paginationControls: $('#pagination-controls'), resultsCountEl: $('#results-count'), platformFilterContainer: $('#platform-filter-container'), platformFilters: $('#platform-filters')
};


async function initialize() {
  setupVisitorCounter();
  setupThemeToggle();
  
  allData = await fetch(API).then(r => r.json());
  
  setupMainFilters();
  setupPriceFilters();
  setupLanguageFilters();
  setupPlatformFilters(); // New
  setupSearch();
  setupSorting();
  
  updateCategoryFilter();
  render();
}

function setupVisitorCounter() { /* ... no changes ... */ }
function setupThemeToggle() { /* ... no changes ... */ }

function setupMainFilters() {
  $$('.type-btn').forEach(btn => {
    btn.onclick = e => {
      $$('.type-btn').forEach(b => b.classList.replace('bg-blue-600', 'bg-gray-300') || b.classList.remove('text-white'));
      e.target.classList.replace('bg-gray-300', 'bg-blue-600');
      e.target.classList.add('text-white');

      state.type = e.target.dataset.type;
      state.currentPage = 1;
      
      // --- UI Visibility Logic ---
      const typeConfig = {
          isYouTube: state.type.includes('YouTube'),
          hasPlatforms: ['IDE', 'Graphics Program', 'Graphics Utility', 'Music DAW', 'Music VST'].includes(state.type),
          hasPrice: !state.type.includes('YouTube') && !state.type.includes('Website'),
          hasPopularity: !state.type.includes('YouTube')
      };

      langFilterContainer.classList.toggle('hidden', !typeConfig.isYouTube);
      platformFilterContainer.classList.toggle('hidden', !typeConfig.hasPlatforms);
      priceFilterContainer.classList.toggle('hidden', !typeConfig.hasPrice);

      $('.sort-option-yt').classList.toggle('hidden', !typeConfig.isYouTube);
      $('.sort-option-pop').classList.toggle('hidden', !typeConfig.hasPopularity);
      
      updateCategoryFilter();
      render();
    };
  });
}

function setupPlatformFilters() {
    const allPlatforms = new Set(allData.flatMap(item => item.platforms || []));
    platformFilters.innerHTML = [...allPlatforms].sort().map(p => `
        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" data-platform="${p}" class="platform-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
            <span class="text-sm">${p}</span>
        </label>
    `).join('');

    $$('.platform-checkbox').forEach(box => {
        box.onchange = e => {
            const platform = e.target.dataset.platform;
            if (e.target.checked) state.platforms.add(platform);
            else state.platforms.delete(platform);
            state.currentPage = 1;
            render();
        };
    });
}


function setupPriceFilters() { /* ... no changes ... */ }
function setupLanguageFilters() { /* ... no changes ... */ }
function setupSearch() { /* ... no changes ... */ }
function setupSorting() { /* ... no changes ... */ }
function updateCategoryFilter() { /* ... no changes ... */ }
const parseSubscribers = (str) => { /* ... no changes ... */ };

function render() {
  // 1. FILTER
  const langArray = [...state.languages];
  const platformArray = [...state.platforms];

  const filteredData = allData.filter(item => {
    const typeMatch = state.type === 'All' || item.type === state.type;
    const tierMatch = state.tier === 0 || item.priceTier === state.tier;
    const categoryMatch = !state.category || item.category === state.category;
    const queryMatch = !state.query || item.name.toLowerCase().includes(state.query) || item.description.toLowerCase().includes(state.query);
    
    // Updated Language/Platform logic
    const langMatch = langArray.length === 0 || (item.languages && langArray.every(lang => item.languages.includes(lang)));
    const platformMatch = platformArray.length === 0 || (item.platforms && platformArray.some(p => item.platforms.includes(p)));

    return typeMatch && tierMatch && categoryMatch && queryMatch && langMatch && platformMatch;
  });

  // 2. SORT
  const sortedData = [...filteredData].sort((a, b) => {
    switch(state.sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'subs_desc': return parseSubscribers(b.subscribers) - parseSubscribers(a.subscribers);
        case 'popularity_desc': return (b.popularityScore || 0) - (a.popularityScore || 0); // New sort
        default: return 0;
    }
  });

  // 3. PAGINATE & RENDER
  resultsCountEl.textContent = `Showing ${sortedData.length} results for: ${state.type}`;
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  state.currentPage = Math.min(state.currentPage, totalPages || 1);

  const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  grid.innerHTML = paginatedData.map(card).join('') || `<p class="col-span-full text-center">No results match your filters.</p>`;
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
    // ... no changes from previous version ...
}

function card(t) {
  const badge = t.priceTier === 1 ? 'Free' : t.priceTier === 2 ? 'Freemium' : 'Paid';
  const badgeColor = t.priceTier === 1 ? 'green' : t.priceTier === 2 ? 'yellow' : 'red';
  const languagesHtml = t.languages ? t.languages.map(lang => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">${lang}</span>`).join(' ') : '';
  const platformsHtml = t.platforms ? t.platforms.map(p => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">${p}</span>`).join(' ') : '';

  return `
  <div class="block rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div class="flex-grow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-lg text-gray-900 dark:text-white">${t.name}</h3>
        ${t.priceTier ? `<span class="text-xs font-medium px-2.5 py-0.5 rounded bg-${badgeColor}-100 text-${badgeColor}-800 dark:bg-${badgeColor}-900 dark:text-${badgeColor}-300">${badge}</span>` : ''}
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">${t.description}</p>
      ${t.subscribers ? `<p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Subs: <strong>${t.subscribers}</strong></p>` : ''}
      <div class="flex flex-wrap gap-2 mb-2">
        ${platformsHtml}
        ${languagesHtml}
      </div>
    </div>
    <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center">
        <p class="text-xs text-gray-500">${t.type} ${t.category ? `• ${t.category}` : ''}</p>
        <a href="${t.url}" target="_blank" rel="noopener" class="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Visit →</a>
      </div>
    </div>
  </div>`;
}

initialize();