/* ---------- CONFIG ---------- */
const API = './tools.json';
const ITEMS_PER_PAGE = 100;
let allData = [];

const state = {
  type: 'All',
  tier: 0,
  category: '',
  query: '',
  languages: new Set(),
  platforms: new Set(),
  courseCategories: new Set(),
  websiteCategories: new Set(),
  musicDawCategories: new Set(),
  sortBy: 'default',
  currentPage: 1,
};

// Previous state backup for fallback
const previousState = {
  type: 'All',
  tier: 0,
  currentPage: 1,
  resultCount: 0
};

/* ---------- HELPERS ---------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- VISITOR COUNTER ---------- */
function setupVisitorCounter() {
  const k = 'devHubVisits';
  let n = parseInt(localStorage.getItem(k) || '0', 10);
  localStorage.setItem(k, ++n);
  $('#visitor-count').textContent = `Visitor count: ${n.toLocaleString()}`;
}

/* ---------- MAIN TOPIC BUTTONS ---------- */
function setupMainFilters() {
  $$('.type-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      // Save current state before changing
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

      state.type        = e.target.dataset.type;
      state.currentPage = 1;

      // Clear course categories when switching away from Dev Course
      if (state.type !== 'Dev Course') {
        state.courseCategories.clear();
        $$('.course-category-checkbox').forEach(cb => cb.checked = false);
      }

      // Clear website categories when switching away from Dev Website
      if (state.type !== 'Dev Website') {
        state.websiteCategories.clear();
        $$('.website-category-checkbox').forEach(cb => cb.checked = false);
      }

      // Clear music DAW categories when switching away from Music DAW
      if (state.type !== 'Music DAW') {
        state.musicDawCategories.clear();
        $$('.music-daw-category-checkbox').forEach(cb => cb.checked = false);
      }

      const isYT       = state.type.includes('YouTube') || state.type === 'YouTube Channel';
      const isAI       = state.type === 'AI Tool';
      const isGraphics = state.type.includes('Graphics');
      const isMusic    = state.type.includes('Music Production') || state.type === 'Music Samples' || state.type === 'Music DAW';
      const isDevCourse = state.type === 'Dev Course';
      const isDevWebsite = state.type === 'Dev Website';
      const isMusicDAW = state.type === 'Music DAW';
      
      // Show language filter only for specific types
      const showLang = !isYT && !isAI && !isGraphics && !isMusic && !isDevCourse && !isDevWebsite && !isMusicDAW;

      const hasPlat  = ['IDE','Graphics Program','Graphics Utility',
                        'Music DAW','Music Production VSTs'].includes(state.type);
      const hasPrice = !isYT && !state.type.includes('Website');

      // Use classList.add/remove instead of toggle for more predictable behavior
      if (showLang) {
        $('#lang-filter-container').classList.remove('hidden');
      } else {
        $('#lang-filter-container').classList.add('hidden');
      }
      
      if (hasPlat) {
        $('#platform-filter-container').classList.remove('hidden');
      } else {
        $('#platform-filter-container').classList.add('hidden');
      }
      
      if (hasPrice) {
        $('#price-filter-container').classList.remove('hidden');
      } else {
        $('#price-filter-container').classList.add('hidden');
      }
      
      if (isDevCourse) {
        $('#course-category-filter-container').classList.remove('hidden');
      } else {
        $('#course-category-filter-container').classList.add('hidden');
      }

      if (isDevWebsite) {
        $('#website-category-filter-container').classList.remove('hidden');
      } else {
        $('#website-category-filter-container').classList.add('hidden');
      }

      // Show music DAW category filter only for Music DAW
      if (isMusicDAW) {
        $('#music-daw-category-filter-container').classList.remove('hidden');
      } else {
        $('#music-daw-category-filter-container').classList.add('hidden');
      }

      $('.sort-option-yt').classList.toggle('hidden', !isYT);
      $('.sort-option-pop').classList.toggle('hidden', isYT);

      render();
    });
  });
}

/* ---------- COURSE CATEGORY FILTERS ---------- */
function setupCourseCategoryFilters() {
  const categories = ['Bootcamp', 'Documentation', 'Interactive', 'University', 'Video'];
  $('#course-category-filters').innerHTML = categories.map(cat => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-category="${cat}" class="course-category-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${cat}</span>
    </label>`).join('');
  
  $$('.course-category-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      const category = e.target.dataset.category;
      e.target.checked 
        ? state.courseCategories.add(category)
        : state.courseCategories.delete(category);
      state.currentPage = 1;
      render();
    })
  );
}

/* ---------- WEBSITE CATEGORY FILTERS ---------- */
function setupWebsiteCategoryFilters() {
  const categories = ['Community', 'Documentation', 'Learning', 'Reference', 'Tools'];
  $('#website-category-filters').innerHTML = categories.map(cat => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-category="${cat}" class="website-category-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${cat}</span>
    </label>`).join('');
  
  $$('.website-category-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      const category = e.target.dataset.category;
      e.target.checked 
        ? state.websiteCategories.add(category)
        : state.websiteCategories.delete(category);
      state.currentPage = 1;
      render();
    })
  );
}

/* ---------- MUSIC DAW CATEGORY FILTERS ---------- */
function setupMusicDawCategoryFilters() {
  const categories = ['Professional', 'Beginner', 'Electronic', 'Recording', 'Open Source', 'Linux'];
  $('#music-daw-category-filters').innerHTML = categories.map(cat => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-category="${cat}" class="music-daw-category-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${cat}</span>
    </label>`).join('');
  
  $$('.music-daw-category-checkbox').forEach(box =>
    box.addEventListener('change', e => {
      const category = e.target.dataset.category;
      e.target.checked 
        ? state.musicDawCategories.add(category)
        : state.musicDawCategories.delete(category);
      state.currentPage = 1;
      render();
    })
  );
}

/* ---------- PRICE BUTTONS ---------- */
function setupPriceFilters() {
  const buttons = $$('.tier-btn');
  const paint   = () => {
    buttons.forEach((b, i) => {
      b.classList.toggle('btn-active', i === state.tier);
      b.classList.toggle('theme-button-active', i === state.tier);
      b.classList.toggle('theme-button', i !== state.tier);
    });
  };
  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      state.tier = idx;
      state.currentPage = 1;
      paint();
      render();
    });
  });
  paint();   // initial colours
}

/* ---------- LANGUAGE ---------- */
function setupLanguageFilters() {
  const all = new Set(allData.flatMap(i => i.languages || []));
  $('#lang-filters').innerHTML = [...all].sort().map(l => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-lang="${l}" class="lang-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${l}</span>
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

/* ---------- PLATFORM ---------- */
function setupPlatformFilters() {
  const all = new Set(allData.flatMap(i => i.platforms || []));
  $('#platform-filters').innerHTML = [...all].sort().map(p => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" data-platform="${p}" class="platform-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
      <span class="text-sm theme-text-secondary">${p}</span>
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
  $('#search').addEventListener('input', e => {
    state.query       = e.target.value.trim().toLowerCase();
    state.currentPage = 1;
    render();
  });
}

/* ---------- SORT ---------- */
function setupSorting() {
  $('#sort-by').addEventListener('change', e => {
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

/* ---------- GET FILTERED COUNT ---------- */
function getFilteredCount() {
  const langArr = [...state.languages];
  const platArr = [...state.platforms];
  const courseCatArr = [...state.courseCategories];
  const websiteCatArr = [...state.websiteCategories];
  const musicDawCatArr = [...state.musicDawCategories];

  return allData.filter(item => {
    // Handle YouTube Channel matching for Dev YouTube button
    let typeMatch;
    if (state.type === 'Dev YouTube') {
      typeMatch = item.type === 'YouTube Channel';
    } else {
      typeMatch = state.type === 'All' || (item.type || 'AI Tool') === state.type;
    }
    
    const tierMatch  = state.tier === 0 || item.priceTier === state.tier;
    const catMatch   = !state.category || item.category === state.category;
    const queryMatch = !state.query ||
          item.name.toLowerCase().includes(state.query) ||
          item.description.toLowerCase().includes(state.query);
    const langMatch  = langArr.length === 0 ||
          (item.languages && langArr.every(l => item.languages.includes(l)));
    const platMatch  = platArr.length === 0 ||
          (item.platforms && platArr.some(p => item.platforms.includes(p)));
    const courseCatMatch = courseCatArr.length === 0 ||
          (item.category && courseCatArr.includes(item.category));
    const websiteCatMatch = websiteCatArr.length === 0 ||
          (item.category && websiteCatArr.includes(item.category));
    const musicDawCatMatch = musicDawCatArr.length === 0 ||
          (item.category && musicDawCatArr.includes(item.category));
    
    return typeMatch && tierMatch && catMatch && queryMatch && langMatch && platMatch && courseCatMatch && websiteCatMatch && musicDawCatMatch;
  }).length;
}

/* ---------- RESTORE PREVIOUS STATE ---------- */
function restorePreviousState() {
  state.type = previousState.type;
  state.tier = previousState.tier;
  state.currentPage = previousState.currentPage;
  
  // Update UI to reflect restored state
  $$('.type-btn').forEach(btn => {
    const isActive = btn.dataset.type === state.type;
    btn.classList.toggle('btn-active', isActive);
    btn.classList.toggle('theme-button-active', isActive);
    btn.classList.toggle('theme-button', !isActive);
  });
  
  // Restore price filter UI
  $$('.tier-btn').forEach((btn, idx) => {
    const isActive = idx === state.tier;
    btn.classList.toggle('btn-active', isActive);
    btn.classList.toggle('theme-button-active', isActive);
    btn.classList.toggle('theme-button', !isActive);
  });
  
  // Clear course categories if we're not on Dev Course
  if (state.type !== 'Dev Course') {
    state.courseCategories.clear();
    $$('.course-category-checkbox').forEach(cb => cb.checked = false);
  }
  
  // Clear website categories if we're not on Dev Website
  if (state.type !== 'Dev Website') {
    state.websiteCategories.clear();
    $$('.website-category-checkbox').forEach(cb => cb.checked = false);
  }
  
  // Clear music DAW categories if we're not on Music DAW
  if (state.type !== 'Music DAW') {
    state.musicDawCategories.clear();
    $$('.music-daw-category-checkbox').forEach(cb => cb.checked = false);
  }
}

/* ---------- CARD ---------- */
function card(t) {
  const badge = t.priceTier === 1 ? 'Free' : t.priceTier === 2 ? 'Freemium' : 'Paid';
  
  // Use static color classes instead of dynamic ones
  let badgeClass = '';
  
  if (t.priceTier === 1) {
    badgeClass = 'bg-green-100 text-green-800';
  } else if (t.priceTier === 2) {
    badgeClass = 'bg-yellow-100 text-yellow-800';
  } else if (t.priceTier === 3) {
    badgeClass = 'bg-red-100 text-red-800';
  }
  
  const langHtml = (t.languages  || []).map(l => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 theme-text-secondary">${l}</span>`).join(' ');
  const platHtml = (t.platforms || []).map(p => `<span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 theme-text-secondary">${p}</span>`).join(' ');

  const ytStats = t.type && t.type.includes('YouTube') && t.subscribers && t.monthlyViews
    ? `<p class="text-sm theme-text-secondary mb-2">Subscribers: <strong>${t.subscribers}</strong> · Monthly Views: <strong>${t.monthlyViews}</strong></p>`
    : '';

  // Add popularity score for Music DAWs if available
  const popularityStats = t.popularityScore && state.type === 'Music DAW'
    ? `<p class="text-sm theme-text-secondary mb-2">Popularity Score: <strong>${t.popularityScore.toLocaleString()}</strong></p>`
    : '';

  return `
  <div class="block rounded-lg theme-card p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div class="flex-grow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-lg theme-text">${t.name}</h3>
        ${t.priceTier ? `<span class="text-xs font-medium px-2.5 py-0.5 rounded ${badgeClass}">${badge}</span>` : ''}
      </div>
      <p class="text-sm theme-text-secondary mb-2">${t.description}</p>
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
    b.disabled    = disabled;
    b.className   = disabled
      ? 'px-3 py-1 rounded border bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'px-3 py-1 rounded border theme-card theme-border hover:bg-gray-100';
    if (!disabled) b.addEventListener('click', () => { state.currentPage = page; render(); });
    return b;
  };

  ctr.appendChild(btn('Prev', state.currentPage - 1, state.currentPage === 1));

  // Show page numbers with ellipsis for large page counts
  const maxVisiblePages = 7;
  let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust start if we're near the end
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
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

  // Page numbers
  for (let p = startPage; p <= endPage; p++) {
    const active = p === state.currentPage;
    const b = document.createElement('button');
    b.textContent = p;
    b.className   = active
      ? 'px-3 py-1 rounded border bg-blue-600 text-white border-blue-600'
      : 'px-3 py-1 rounded border theme-card theme-border hover:bg-gray-100';
    b.addEventListener('click', () => { state.currentPage = p; render(); });
    ctr.appendChild(b);
  }

  // Last page
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
}

/* ---------- RENDER ---------- */
function render() {
  const langArr = [...state.languages];
  const platArr = [...state.platforms];
  const courseCatArr = [...state.courseCategories];
  const websiteCatArr = [...state.websiteCategories];
  const musicDawCatArr = [...state.musicDawCategories];

  let filtered = allData.filter(item => {
    // Handle YouTube Channel matching for Dev YouTube button
    let typeMatch;
    if (state.type === 'Dev YouTube') {
      typeMatch = item.type === 'YouTube Channel';
    } else {
      typeMatch = state.type === 'All' || (item.type || 'AI Tool') === state.type;
    }
    
    const tierMatch  = state.tier === 0 || item.priceTier === state.tier;
    const catMatch   = !state.category || item.category === state.category;
    const queryMatch = !state.query ||
          item.name.toLowerCase().includes(state.query) ||
          item.description.toLowerCase().includes(state.query);
    const langMatch  = langArr.length === 0 ||
          (item.languages && langArr.every(l => item.languages.includes(l)));
    const platMatch  = platArr.length === 0 ||
          (item.platforms && platArr.some(p => item.platforms.includes(p)));
    const courseCatMatch = courseCatArr.length === 0 ||
          (item.category && courseCatArr.includes(item.category));
    const websiteCatMatch = websiteCatArr.length === 0 ||
          (item.category && websiteCatArr.includes(item.category));
    const musicDawCatMatch = musicDawCatArr.length === 0 ||
          (item.category && musicDawCatArr.includes(item.category));
    
    return typeMatch && tierMatch && catMatch && queryMatch && langMatch && platMatch && courseCatMatch && websiteCatMatch && musicDawCatMatch;
  });

  /* EMPTY-SET GUARD — restore previous state if no results and not on "All" */
  if (filtered.length === 0 && state.type !== 'All' && previousState.resultCount > 0) {
    console.log(`No results found for "${state.type}". Restoring previous category: "${previousState.type}"`);
    restorePreviousState();
    // Re-run render with restored state
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

  // Calculate the range of results being shown
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allData = await response.json();
    console.log('Data loaded successfully:', allData);
    
    setupVisitorCounter();
    setupMainFilters();
    setupPriceFilters();
    setupLanguageFilters();
    setupPlatformFilters();
    setupCourseCategoryFilters();
    setupWebsiteCategoryFilters();
    setupMusicDawCategoryFilters();
    setupSearch();
    setupSorting();
    render();
  } catch (error) {
    console.error('Error loading data:', error);
    $('#grid').innerHTML = `<p class="col-span-full text-center theme-text-secondary">Error loading data: ${error.message}</p>`;
  }
})();