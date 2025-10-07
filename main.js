const API = './tools.json';
const ITEMS_PER_PAGE = 24;
let allData = [];

const state = {
  type: 'All',
  tier: 0,
  category: '',
  query: '',
  languages: new Set(),
  platforms: new Set(),
  sortBy: 'default',
  currentPage: 1,
};

/* ---------- DOM SHORTCUTS ---------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const grid                  = $('#grid');
const search                = $('#search');
const sortBy                = $('#sort-by');
const themeBtn              = $('#theme-toggle');
const visitorCountEl        = $('#visitor-count');
const langFilterContainer   = $('#lang-filter-container');
const priceFilterContainer  = $('#price-filter-container');
const platformFilterContainer=$('#platform-filter-container');
const langFilters           = $('#lang-filters');
const platformFilters       = $('#platform-filters');
const paginationControls    = $('#pagination-controls');
const resultsCountEl        = $('#results-count');

/* ---------- INIT ---------- */
async function initialize() {
  setupVisitorCounter();
  installThemeToggle();        // visible & working
  allData = await fetch(API).then(r => r.json());
  setupMainFilters();
  setupPriceFilters();
  setupLanguageFilters();
  setupPlatformFilters();
  setupSearch();
  setupSorting();
  render();
}

/* ---------- THEME (VISIBLE & WORKING) ---------- */
function installThemeToggle() {
  const apply = () => {
    const dark = localStorage.theme === 'dark' ||
                (!('theme' in localStorage) &&
                 window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    return dark;
  };
  apply();                                    // first paint
  themeBtn.addEventListener('click', () => {
    localStorage.theme = apply() ? 'light' : 'dark';
    apply();                                  // re-apply
  });
}

/* ---------- VISITOR COUNTER ---------- */
function setupVisitorCounter() {
  const k = 'devHubVisits';
  let n = parseInt(localStorage.getItem(k) || '0', 10);
  localStorage.setItem(k, ++n);
  visitorCountEl.textContent = `Visitor count: ${n.toLocaleString()}`;
}

/* ---------- MAIN TYPE BUTTONS ---------- */
function setupMainFilters() {
  $$('.type-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      $$('.type-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
      $$('.type-btn').forEach(b => b.classList.add('bg-gray-300', 'dark:bg-gray-700'));
      e.target.classList.add('bg-blue-600', 'text-white');

      state.type        = e.target.dataset.type;
      state.currentPage = 1;

      const isYT      = state.type.includes('YouTube');
      const isAI      = state.type === 'AI Tool';
      const isGraphics= state.type.includes('Graphics');
      const isMusic   = state.type.includes('Music Production');
      const hideLang  = isYT || isAI || isGraphics || isMusic;   // <- NEW
      const hasPlat   = ['IDE','Graphics Program','Graphics Utility','Music DAW','Music VST'].includes(state.type);
      const hasPrice  = !isYT && !state.type.includes('Website');

      langFilterContainer.classList.toggle('hidden', hideLang);   // hide langs for these
      platformFilterContainer.classList.toggle('hidden', !hasPlat);
      priceFilterContainer.classList.toggle('hidden', !hasPrice);
      $('.sort-option-yt').classList.toggle('hidden', !isYT);
      $('.sort-option-pop').classList.toggle('hidden', isYT);  // only name/pop for YouTube

      render();
    });
  });
}

/* ---------- PRICE ---------- */
function setupPriceFilters() {
  $$('.tier-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      $$('.tier-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
      $$('.tier-btn').forEach(b => b.classList.add('bg-gray-300', 'dark:bg-gray-700'));
      e.target.classList.add('bg-blue-600', 'text-white');
      state.tier        = Number(e.target.dataset.tier);
      state.currentPage = 1;
      render();
    });
  });
}

/* ---------- LANGUAGE ---------- */
function setupLanguageFilters() {
  const all = new Set(allData.flatMap(i => i.languages || []));
  langFilters.innerHTML = [...all].sort().map(l => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-lang="${l}" class="lang-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm">${l}</span>
    </label>`).join('');
  $$('.lang-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      e.target.checked ? state.languages.add(e.target.dataset.lang)
                       : state.languages.delete(e.target.dataset.lang);
      state.currentPage = 1;
      render();
    })
  );
}

/* ---------- PLATFORM ---------- */
function setupPlatformFilters() {
  const all = new Set(allData.flatMap(i => i.platforms || []));
  platformFilters.innerHTML = [...all].sort().map(p => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-platform="${p}" class="platform-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm">${p}</span>
    </label>`).join('');
  $$('.platform-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      const p = e.target.dataset.platform;
      e.target.checked ? state.platforms.add(p) : state.platforms.delete(p);
      state.currentPage = 1;
      render();
    })
  );
}

/* ---------- SEARCH ---------- */
function setupSearch() {
  search.addEventListener('input', e => {
    state.query       = e.target.value.trim().toLowerCase();
    state.currentPage = 1;
    render();
  });
}

/* ---------- SORT ---------- */
function setupSorting() {
  sortBy.addEventListener('change', e => {
    state.sortBy      = e.target.value;
    state.currentPage = 1;
    render();
  });
}

/* ---------- SUBSCRIBER PARSER ---------- */
const parseSubscribers = str => {
  if (!str) return 0;
  const m = str.toUpperCase().match(/^([\d.]+)\s*(K|M)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2] === 'K' ? n * 1000 : m[2] === 'M' ? n * 1000000 : n;
};

/* ---------- RENDER ---------- */
function render() {
  const langArr = [...state.languages];
  const platArr = [...state.platforms];

  let filtered = allData.filter(item => {
    const typeMatch  = state.type === 'All' || (item.type || 'AI Tool') === state.type;
    const tierMatch  = state.tier === 0 || item.priceTier === state.tier;
    const catMatch   = !state.category || item.category === state.category;
    const queryMatch = !state.query ||
          item.name.toLowerCase().includes(state.query) ||
          item.description.toLowerCase().includes(state.query);
    const langMatch  = langArr.length === 0 ||
          (item.languages && langArr.every(l => item.languages.includes(l)));
    const platMatch  = platArr.length === 0 ||
          (item.platforms && platArr.some(p => item.platforms.includes(p)));
    return typeMatch && tierMatch && catMatch && queryMatch && langMatch && platMatch;
  });

  /* DEFAULT-TO-ALL GUARD */
  if (filtered.length === 0 && state.type !== 'All') {
    state.type        = 'All';
    state.currentPage = 1;
    render();
    return;
  }

  /* SORT */
  const sorted = [...filtered].sort((a, b) => {
    switch (state.sortBy) {
      case 'name_asc':  return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'subs_desc': return parseSubscribers(b.subscribers) - parseSubscribers(a.subscribers);
      case 'popularity_desc': return (b.popularityScore || 0) - (a.popularityScore || 0);
      default:          return 0;
    }
  });

  /* PAGINATE */
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  state.currentPage = Math.min(state.currentPage, totalPages || 1);
  const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const page  = sorted.slice(start, start + ITEMS_PER_PAGE);

  resultsCountEl.textContent = `Showing ${sorted.length} results`;
  grid.innerHTML = page.map(card).join('') ||
                   `<p class="col-span-full text-center">No results match your filters.</p>`;
  renderPagination(totalPages);
}

/* ---------- CARD ---------- */
function card(t) {
  const badge    = t.priceTier === 1 ? 'Free' : t.priceTier === 2 ? 'Freemium' : 'Paid';
  const badgeCol = t.priceTier === 1 ? 'green' : t.priceTier === 2 ? 'yellow' : 'red';
  const langHtml = (t.languages  || []).map(l => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">${l}</span>`).join(' ');
  const platHtml = (t.platforms || []).map(p => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">${p}</span>`).join(' ');

  // YouTube stats
  const ytStats = t.type && t.type.includes('YouTube') && t.subscribers && t.monthlyViews
    ? `<p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Subscribers: <strong>${t.subscribers}</strong> · Monthly Views: <strong>${t.monthlyViews}</strong></p>`
    : '';

  return `
  <div class="block rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div class="flex-grow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-lg text-gray-900 dark:text-white">${t.name}</h3>
        ${t.priceTier ? `<span class="text-xs font-medium px-2.5 py-0.5 rounded bg-${badgeCol}-100 text-${badgeCol}-800 dark:bg-${badgeCol}-900 dark:text-${badgeCol}-300">${badge}</span>` : ''}
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">${t.description}</p>
      ${ytStats}
      <div class="flex flex-wrap gap-2 mb-2">${platHtml} ${langHtml}</div>
    </div>
    <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center">
        <p class="text-xs text-gray-500">${t.type}${t.category ? ` • ${t.category}` : ''}</p>
        <a href="${t.url}" target="_blank" rel="noopener" class="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Visit →</a>
      </div>
    </div>
  </div>`;
}

/* ---------- PAGINATION ---------- */
function renderPagination(totalPages) {
  paginationControls.innerHTML = '';
  if (totalPages <= 1) return;

  const btn = (label, page, disabled = false) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled    = disabled;
    b.className   = disabled
      ? 'px-3 py-1 rounded border bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
      : 'px-3 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';
    if (!disabled) b.addEventListener('click', () => { state.currentPage = page; render(); });
    return b;
  };

  paginationControls.appendChild(btn('Prev', state.currentPage - 1, state.currentPage === 1));

  for (let p = 1; p <= totalPages; p++) {
    const active = p === state.currentPage;
    const b = document.createElement('button');
    b.textContent = p;
    b.className   = active
      ? 'px-3 py-1 rounded border bg-blue-600 text-white border-blue-600'
      : 'px-3 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';
    b.addEventListener('click', () => { state.currentPage = p; render(); });
    paginationControls.appendChild(b);
  }

  paginationControls.appendChild(btn('Next', state.currentPage + 1, state.currentPage === totalPages));
}

/* ---------- BOOTSTRAP ---------- */
initialize();