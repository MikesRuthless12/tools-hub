/* ---------- CONFIG ---------- */
const API = './tools.json';
const ITEMS_PER_PAGE = 100;
let allData = [];

const state = {
  type: 'All',
  tier: 0,
  query: '',
  languages: new Set(),
  platforms: new Set(),
  courseCategories: new Set(),
  websiteCategories: new Set(),
  graphicsCourseCategories: new Set(),
  sortBy: 'default',
  currentPage: 1,
};

const previousState = {
  type: 'All',
  tier: 0,
  currentPage: 1,
  resultCount: 0
};

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- VISITOR COUNTER ---------- */
function setupVisitorCounter() {
  const k = 'devHubVisits';
  let n = parseInt(localStorage.getItem(k) || '0', 10);
  localStorage.setItem(k, ++n);
  $('#visitor-count').textContent = `Visitor count: ${n.toLocaleString()}`;
}

/* ---------- TYPE MATCHER ---------- */
function buildTypeMatcher(stateType, item) {
  if (stateType === 'Music Production Websites') return item.type === 'Music Production Website';
  if (stateType === 'Music Production VSTs') return item.type === 'Music VST';
  if (stateType === 'Music Production Courses') return item.type === 'Music Course';
  if (stateType === 'Music DAW') return item.type === 'Music DAW';
  if (stateType === 'Music Samples') return item.type === 'Music Samples';

  if (stateType.includes('YouTube')) {
    if (item.type !== 'YouTube Channel') return false;
    const cat = (item.category || '').toLowerCase();
    if (stateType === 'Graphics YouTube') {
      return ['graphic design','motion design','3d modeling','ui/ux design','web design','photo editing','illustration','animation','vfx','typography','product design','packaging design','color theory','game design'].some(c => cat.includes(c));
    }
    return true;
  }

  if (stateType.includes('Websites')) {
    if (item.type !== 'Dev Website' && item.type !== 'Music Production Website') return false;
    return true;
  }

  if (stateType.includes('Courses')) {
    if (item.type !== 'Dev Course' && item.type !== 'Music Course') return false;
    const cat = (item.category || '').toLowerCase();
    if (cat === 'frontend' || cat === 'backend') return false;
    return true;
  }

  return stateType === 'All' || (item.type || 'AI Tool') === stateType;
}

/* ---------- MAIN TOPIC BUTTONS ---------- */
function setupMainFilters() {
  $$('.type-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      previousState.type = state.type;
      previousState.tier = state.tier;
      previousState.currentPage = state.currentPage;
      previousState.resultCount = getFilteredCount();

      $$('.type-btn').forEach(b => {
        b.classList.remove('btn-active', 'theme-button-active');
        b.classList.add('theme-button');
      });
      e.target.classList.remove('theme-button');
      e.target.classList.add('btn-active', 'theme-button-active');

      state.type = e.target.dataset.type;
      state.currentPage = 1;

      const isCourse = state.type.includes('Courses');
      const isWebsite = state.type.includes('Websites');
      const isGraphics = state.type === 'Graphics Course';
      const isMusic = state.type.includes('Music Production') || state.type === 'Music DAW' || state.type === 'Music Samples';
      const isYouTube = state.type.includes('YouTube');
      const isAI = state.type === 'AI Tool';

      if (!isCourse) {
        state.courseCategories.clear();
        $$('.course-category-checkbox').forEach(cb => cb.checked = false);
      }
      if (!isWebsite) {
        state.websiteCategories.clear();
        $$('.website-category-checkbox').forEach(cb => cb.checked = false);
      }
      if (!isGraphics) {
        state.graphicsCourseCategories.clear();
        $$('.graphics-course-category-checkbox').forEach(cb => cb.checked = false);
      }

      const showLang = !isYouTube && !isAI && !isGraphics && !isMusic && !isCourse && !isWebsite;
      const hasPlat = ['IDE','Graphics Program','Music DAW','Music Production VSTs'].includes(state.type);
      const hasPrice = !isYouTube && !isWebsite;

      if (showLang) $('#lang-filter-container').classList.remove('hidden'); else $('#lang-filter-container').classList.add('hidden');
      if (hasPlat) $('#platform-filter-container').classList.remove('hidden'); else $('#platform-filter-container').classList.add('hidden');
      if (hasPrice) $('#price-filter-container').classList.remove('hidden'); else $('#price-filter-container').classList.add('hidden');
      if (isCourse) $('#course-category-filter-container').classList.remove('hidden'); else $('#course-category-filter-container').classList.add('hidden');
      if (isWebsite) $('#website-category-filter-container').classList.remove('hidden'); else $('#website-category-filter-container').classList.add('hidden');
      if (isGraphics) $('#graphics-course-category-filter-container').classList.remove('hidden'); else $('#graphics-course-category-filter-container').classList.add('hidden');

      const showPopularity = state.type === 'Music Samples' || state.type === 'Music Production VSTs' || state.type === 'Music DAW';
      $('.sort-option-yt').classList.toggle('hidden', !isYouTube);
      $('.sort-option-pop').classList.toggle('hidden', !showPopularity);

      render();
    });
  });
}

/* ---------- WEBSITE CATEGORY FILTERS ---------- */
function setupWebsiteCategoryFilters() {
  const categories = ['Community', 'Marketplace', 'Samples', 'Learning', 'Reference', 'Tools'];
  $('#website-category-filters').innerHTML = categories.map(cat => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-category="${cat}" class="website-category-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${cat}</span>
    </label>`).join('');
  $$('.website-category-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      e.target.checked
        ? state.websiteCategories.add(e.target.dataset.category)
        : state.websiteCategories.delete(e.target.dataset.category);
      state.currentPage = 1; render();
    })
  );
}

/* ---------- COURSE / GRAPHICS FILTERS ---------- */
function setupCourseCategoryFilters() {
  const categories = ['Bootcamp', 'Documentation', 'Interactive', 'University', 'Video'];
  $('#course-category-filters').innerHTML = categories.map(cat => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-category="${cat}" class="course-category-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${cat}</span>
    </label>`).join('');
  $$('.course-category-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      e.target.checked
        ? state.courseCategories.add(e.target.dataset.category)
        : state.courseCategories.delete(e.target.dataset.category);
      state.currentPage = 1; render();
    })
  );
}

function setupGraphicsCourseCategoryFilters() {
  const categories = ['Bootcamp', 'Documentation', 'Interactive', 'University', 'Video'];
  $('#graphics-course-category-filters').innerHTML = categories.map(cat => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-category="${cat}" class="graphics-course-category-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${cat}</span>
    </label>`).join('');
  $$('.graphics-course-category-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      e.target.checked
        ? state.graphicsCourseCategories.add(e.target.dataset.category)
        : state.graphicsCourseCategories.delete(e.target.dataset.category);
      state.currentPage = 1; render();
    })
  );
}

/* ---------- PRICE FILTERS ---------- */
function setupPriceFilters() {
  const buttons = $$('.tier-btn');
  const paint = () => buttons.forEach((b, i) => {
    b.classList.toggle('btn-active', i === state.tier);
    b.classList.toggle('theme-button-active', i === state.tier);
    b.classList.toggle('theme-button', i !== state.tier);
  });
  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => { state.tier = idx; state.currentPage = 1; paint(); render(); });
  });
  paint();
}

/* ------------------------------------------------------------------ */
/*  LANGUAGE FILTER – ONLY DEV CATEGORIES  &  HIDE ZERO-RESULT LANGS  */
/* ------------------------------------------------------------------ */
function setupLanguageFilters() {
  const allLangs = [...new Set(allData.flatMap(i => i.languages || []))].sort();

  function countPerLang() {
    // temp remove language filter so we count "other filters only"
    const langArr = [...state.languages];
    state.languages.clear();

    const platArr   = [...state.platforms];
    const courseArr = [...state.courseCategories];
    const webArr    = [...state.websiteCategories];
    const gcArr     = [...state.graphicsCourseCategories];

    const tally = {};
    allLangs.forEach(l => tally[l] = 0);

    allData.forEach(it => {
      if (
        buildTypeMatcher(state.type, it) &&
        (state.tier === 0 || it.priceTier === state.tier) &&
        (!state.query ||
          (it.name && it.name.toLowerCase().includes(state.query)) ||
          (it.description && it.description.toLowerCase().includes(state.query))) &&
        (platArr.length === 0 || (it.platforms && platArr.some(p => it.platforms.includes(p)))) &&
        (courseArr.length === 0 || (it.category && courseArr.includes(it.category))) &&
        (webArr.length === 0 || ((it.category || it.websiteCategory) && webArr.includes(it.category || it.websiteCategory))) &&
        (gcArr.length === 0 || (it.category && gcArr.includes(it.category)))
      ) {
        (it.languages || []).forEach(l => tally[l]++);
      }
    });

    // restore user ticks
    langArr.forEach(l => state.languages.add(l));
    return tally;
  }

  function paint() {
    const devCats = ['IDE', 'Dev Course', 'Dev Website', 'Dev YouTube'];
    const isDev   = devCats.includes(state.type);
    $('#lang-filter-container').classList.toggle('hidden', !isDev);
    if (!isDev) return;

    const tally = countPerLang();

    $('#lang-filters').innerHTML = allLangs
      .filter(l => tally[l] > 0) // hide 0-result languages
      .map(l => `
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" data-lang="${l}" ${state.languages.has(l) ? 'checked' : ''}
                 class="lang-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
          <span class="text-sm theme-text-secondary">${l} <span class="text-xs text-gray-400">(${tally[l]})</span></span>
        </label>`).join('');

    $$('.lang-checkbox').forEach(box =>
      box.addEventListener('change', e => {
        e.target.checked
          ? state.languages.add(e.target.dataset.lang)
          : state.languages.delete(e.target.dataset.lang);
        state.currentPage = 1;
        render();
      })
    );
  }

  paint(); // first draw

  $$('.type-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const devCats = ['IDE', 'Dev Course', 'Dev Website', 'Dev YouTube'];
      if (devCats.includes(previousState.type)) state.languages.clear();
      paint();
    })
  );
}

/* ------------------------------------------------------------------ */
/*  PLATFORM FILTER – RESTRICTED & AUTO-CLEAR                         */
/* ------------------------------------------------------------------ */
function setupPlatformFilters() {
  const allPlatforms = new Set(allData.flatMap(i => i.platforms || []));
  const whitelist = {
    'Music Production VSTs': ['Windows', 'macOS', 'Linux'],
    'Music DAW':             ['Windows', 'macOS', 'Linux'],
    'Graphics Program':      ['Windows', 'macOS', 'Linux'], // ChromeOS / iOS / iPad removed
  };

  function paint() {
    const activeType = state.type;
    const allowed = whitelist[activeType] || [...allPlatforms].sort();

    $('#platform-filters').innerHTML = allowed.map(p => `
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" data-platform="${p}"
               class="platform-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
        <span class="text-sm theme-text-secondary">${p}</span>
      </label>`).join('');

    $$('.platform-checkbox').forEach(box =>
      box.addEventListener('change', e => {
        e.target.checked
          ? state.platforms.add(e.target.dataset.platform)
          : state.platforms.delete(e.target.dataset.platform);
        state.currentPage = 1;
        render();
      })
    );
  }

  paint(); // initial

  $$('.type-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const restricted = ['Music Production VSTs', 'Music DAW', 'Graphics Program'];
      if (restricted.includes(previousState.type)) state.platforms.clear();
      paint();
    })
  );
}

/* ---------- SEARCH ---------- */
function setupSearch() {
  $('#search').addEventListener('input', e => {
    state.query = e.target.value.trim().toLowerCase();
    state.currentPage = 1;
    render();
  });
}

/* ---------- SORT ---------- */
function setupSorting() {
  $('#sort-by').addEventListener('change', e => {
    state.sortBy = e.target.value;
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

/* ---------- GET FILTERED COUNT ---------- */
function getFilteredCount() {
  const langArr = [...state.languages];
  const platArr = [...state.platforms];
  const courseCatArr = [...state.courseCategories];
  const websiteCatArr = [...state.websiteCategories];
  const graphicsCourseCatArr = [...state.graphicsCourseCategories];

  return allData.filter(item => {
    const typeMatch = buildTypeMatcher(state.type, item);
    const tierMatch = state.tier === 0 || item.priceTier === state.tier;
    const queryMatch = !state.query ||
      (item.name && item.name.toLowerCase().includes(state.query)) ||
      (item.description && item.description.toLowerCase().includes(state.query));
    const langMatch = langArr.length === 0 ||
      (item.languages && langArr.every(l => item.languages.includes(l)));
    const platMatch = platArr.length === 0 ||
      (item.platforms && platArr.some(p => item.platforms.includes(p)));
    const courseCatMatch = courseCatArr.length === 0 ||
      (item.category && courseCatArr.includes(item.category));
    const websiteCatMatch = websiteCatArr.length === 0 ||
      ((item.category || item.websiteCategory) && websiteCatArr.includes(item.category || item.websiteCategory));
    const graphicsCourseCatMatch = graphicsCourseCatArr.length === 0 ||
      (item.category && graphicsCourseCatArr.includes(item.category));

    return typeMatch && tierMatch && queryMatch && langMatch && platMatch && courseCatMatch && websiteCatMatch && graphicsCourseCatMatch;
  }).length;
}

/* ---------- RESTORE PREVIOUS STATE ---------- */
function restorePreviousState() {
  state.type = previousState.type;
  state.tier = previousState.tier;
  state.currentPage = previousState.currentPage;

  $$('.type-btn').forEach(btn => {
    const isActive = btn.dataset.type === state.type;
    btn.classList.toggle('btn-active', isActive);
    btn.classList.toggle('theme-button-active', isActive);
    btn.classList.toggle('theme-button', !isActive);
  });
  $$('.tier-btn').forEach((btn, idx) => {
    const isActive = idx === state.tier;
    btn.classList.toggle('btn-active', isActive);
    btn.classList.toggle('theme-button-active', isActive);
    btn.classList.toggle('theme-button', !isActive);
  });

  if (!state.type.includes('Courses')) {
    state.courseCategories.clear();
    $$('.course-category-checkbox').forEach(cb => cb.checked = false);
  }
  if (!state.type.includes('Websites')) {
    state.websiteCategories.clear();
    $$('.website-category-checkbox').forEach(cb => cb.checked = false);
  }
  if (state.type !== 'Graphics Course') {
    state.graphicsCourseCategories.clear();
    $$('.graphics-course-category-checkbox').forEach(cb => cb.checked = false);
  }
}

/* ---------- CARD TEMPLATE ---------- */
function card(t) {
  const badge = t.priceTier === 1 ? 'Free' : t.priceTier === 2 ? 'Freemium' : 'Paid';
  let badgeClass = '';
  if (t.priceTier === 1) badgeClass = 'bg-green-100 text-green-800';
  else if (t.priceTier === 2) badgeClass = 'bg-yellow-100 text-yellow-800';
  else if (t.priceTier === 3) badgeClass = 'bg-red-100 text-red-800';

  const langHtml = (t.languages || []).map(l => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 theme-text-secondary">${l}</span>`).join(' ');
  const platHtml = (t.platforms || []).map(p => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 theme-text-secondary">${p}</span>`).join(' ');

  const ytStats = t.type && (t.type.includes('YouTube') || t.type === 'YouTube Channel') && t.subscribers && t.monthlyViews
    ? `<p class="text-sm theme-text-secondary mb-2">Subscribers: <strong>${t.subscribers}</strong> · Monthly Views: <strong>${t.monthlyViews}</strong></p>`
    : '';

  const popularityStats = t.popularityScore && (state.type === 'Music DAW' || state.type === 'Music Samples' || state.type === 'Music Production VSTs')
    ? `<p class="text-sm theme-text-secondary mb-2">Popularity Score: <strong>${t.popularityScore.toLocaleString()}</strong></p>`
    : '';

  const pricingInfo = t.pricingDesc
    ? `<p class="text-sm theme-text-secondary mb-2">${t.pricingDesc}</p>`
    : '';

  return `
  <div class="block rounded-lg theme-card p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div class="flex-grow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-lg theme-text">${t.name}</h3>
        ${t.priceTier ? `<span class="text-xs font-medium px-2.5 py-0.5 rounded ${badgeClass}">${badge}</span>` : ''}
      </div>
      <p class="text-sm theme-text-secondary mb-2">${t.description}</p>
      ${pricingInfo}
      ${ytStats}
      ${popularityStats}
      <div class="flex flex-wrap gap-2 mb-2">${platHtml} ${langHtml}</div>
    </div>
    <div class="mt-auto pt-4 border-t theme-border">
      <div class="flex justify-between items-center">
        <p class="text-xs theme-text-secondary">${t.type}${t.category ? ` • ${t.category}` : ''}</p>
        <a href="${t.url}" target="_blank" rel="noopener" class="text-sm font-semibold text-blue-600 hover:text-blue-500">Visit →</a>
      </div>
    </div>
  </div>`;
}

/* ---------- PAGINATION ---------- */
function renderPagination(totalPages) {
  const ctr = $('#pagination-controls');
  ctr.innerHTML = '';
  if (totalPages <= 1) return;

  const btn = (label, page, disabled = false) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = disabled;
    b.className = disabled
      ? 'px-3 py-1 rounded border bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'px-3 py-1 rounded border theme-card theme-border hover:bg-gray-100';
    if (!disabled) b.addEventListener('click', () => { state.currentPage = page; render(); });
    return b;
  };

  ctr.appendChild(btn('Prev', state.currentPage - 1, state.currentPage === 1));

  const maxVisiblePages = 7;
  let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage < maxVisiblePages - 1) startPage = Math.max(1, endPage - maxVisiblePages + 1);

  if (startPage > 1) {
    const b = document.createElement('button');
    b.textContent = '1';
    b.className = 'px-3 py-1 rounded border theme-card theme-border hover:bg-gray-100';
    b.addEventListener('click', () => { state.currentPage = 1; render(); });
    ctr.appendChild(b);
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'px-2 theme-text-secondary';
      ctr.appendChild(ellipsis);
    }
  }

  for (let p = startPage; p <= endPage; p++) {
    const active = p === state.currentPage;
    const b = document.createElement('button');
    b.textContent = p;
    b.className = active
      ? 'px-3 py-1 rounded border bg-blue-600 text-white border-blue-600'
      : 'px-3 py-1 rounded border theme-card theme-border hover:bg-gray-100';
    b.addEventListener('click', () => { state.currentPage = p; render(); });
    ctr.appendChild(b);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'px-2 theme-text-secondary';
      ctr.appendChild(ellipsis);
    }
    const b = document.createElement('button');
    b.textContent = totalPages;
    b.className = 'px-3 py-1 rounded border theme-card theme-border hover:bg-gray-100';
    b.addEventListener('click', () => { state.currentPage = totalPages; render(); });
    ctr.appendChild(b);
  }

  ctr.appendChild(btn('Next', state.currentPage + 1, state.currentPage === totalPages));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- RENDER ---------- */
function render() {
  const langArr = [...state.languages];
  const platArr = [...state.platforms];
  const courseCatArr = [...state.courseCategories];
  const websiteCatArr = [...state.websiteCategories];
  const graphicsCourseCatArr = [...state.graphicsCourseCategories];

  let filtered = allData.filter(item => {
    const typeMatch = buildTypeMatcher(state.type, item);
    const tierMatch = state.tier === 0 || item.priceTier === state.tier;
    const queryMatch = !state.query ||
      (item.name && item.name.toLowerCase().includes(state.query)) ||
      (item.description && item.description.toLowerCase().includes(state.query));
    const langMatch = langArr.length === 0 ||
      (item.languages && langArr.every(l => item.languages.includes(l)));
    const platMatch = platArr.length === 0 ||
      (item.platforms && platArr.some(p => item.platforms.includes(p)));
    const courseCatMatch = courseCatArr.length === 0 ||
      (item.category && courseCatArr.includes(item.category));
    const websiteCatMatch = websiteCatArr.length === 0 ||
      ((item.category || item.websiteCategory) && websiteCatArr.includes(item.category || item.websiteCategory));
    const graphicsCourseCatMatch = graphicsCourseCatArr.length === 0 ||
      (item.category && graphicsCourseCatArr.includes(item.category));

    return typeMatch && tierMatch && queryMatch && langMatch && platMatch && courseCatMatch && websiteCatMatch && graphicsCourseCatMatch;
  });

  if (filtered.length === 0 && state.type !== 'All' && previousState.resultCount > 0) {
    restorePreviousState();
    render();
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    switch (state.sortBy) {
      case 'name_asc': return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'subs_desc': return parseSubscribers(b.subscribers) - parseSubscribers(a.subscribers);
      case 'popularity_desc': return (b.popularityScore || 0) - (a.popularityScore || 0);
      default: return 0;
    }
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  state.currentPage = Math.min(state.currentPage, totalPages || 1);
  const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const page = sorted.slice(start, start + ITEMS_PER_PAGE);

  const startResult = sorted.length > 0 ? start + 1 : 0;
  const endResult = Math.min(start + ITEMS_PER_PAGE, sorted.length);

  $('#results-count').textContent = sorted.length > 0
    ? `Showing results ${startResult}-${endResult} of ${sorted.length}`
    : 'Showing 0 results';

  $('#grid').innerHTML = page.map(card).join('') ||
                   `<p class="col-span-full text-center theme-text-secondary">No results match your filters.</p>`;
  renderPagination(totalPages);
}

/* ---------- BOOTSTRAP ---------- */
(async () => {
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    allData = await response.json();
    setupVisitorCounter();
    setupMainFilters();
    setupPriceFilters();
    setupLanguageFilters();
    setupPlatformFilters();
    setupCourseCategoryFilters();
    setupGraphicsCourseCategoryFilters();
    setupWebsiteCategoryFilters();
    setupSearch();
    setupSorting();
    render();
  } catch (error) {
    console.error('Error loading data:', error);
    $('#grid').innerHTML = `<p class="col-span-full text-center theme-text-secondary">Error loading data: ${error.message}</p>`;
  }
})();
