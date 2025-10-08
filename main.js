<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>The Ultimate Developer & Creator Hub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="icon" href="softwareDevTools.ico" type="image/x-icon">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .btn-active{
      background-color:#2563eb !important;
      color:#fff !important;
    }

    /* Light theme (default) */
    :root {
      --bg-primary: #f3f4f6;
      --bg-secondary: #ffffff;
      --bg-tertiary: #e5e7eb;
      --bg-card: #ffffff;
      --text-primary: #1f2937;
      --text-secondary: #6b7280;
      --text-tertiary: #374151;
      --border-color: #d1d5db;
      --button-bg: #d1d5db;
      --button-active-bg: #2563eb;
      --button-active-text: #ffffff;
    }

    /* Dark theme */
    .dark-mode {
      --bg-primary: #111827;
      --bg-secondary: #1f2937;
      --bg-tertiary: #374151;
      --bg-card: #1f2937;
      --text-primary: #f9fafb;
      --text-secondary: #d1d5db;
      --text-tertiary: #9ca3af;
      --border-color: #4b5563;
      --button-bg: #374151;
      --button-active-bg: #2563eb;
      --button-active-text: #ffffff;
    }

    /* Apply CSS variables to body */
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      transition: background-color 0.3s, color 0.3s;
    }

    /* Apply CSS variables to all elements */
    .bg-gray-100 { background-color: var(--bg-primary) !important; }
    .bg-white { background-color: var(--bg-card) !important; }
    .bg-gray-200 { background-color: var(--bg-tertiary) !important; }
    .bg-gray-300 { background-color: var(--button-bg) !important; }
    
    .text-gray-800 { color: var(--text-primary) !important; }
    .text-gray-700 { color: var(--text-primary) !important; }
    .text-gray-600 { color: var(--text-tertiary) !important; }
    .text-gray-500 { color: var(--text-secondary) !important; }
    
    .border-gray-200 { border-color: var(--border-color) !important; }
    .border-gray-300 { border-color: var(--border-color) !important; }

    /* Custom classes for theme */
    .theme-bg { background-color: var(--bg-primary) !important; }
    .theme-card { background-color: var(--bg-card) !important; }
    .theme-filter { background-color: var(--bg-tertiary) !important; }
    .theme-button { 
      background-color: var(--button-bg) !important; 
      color: var(--text-primary) !important;
    }
    .theme-button-active { 
      background-color: var(--button-active-bg) !important; 
      color: var(--button-active-text) !important;
    }
    .theme-text { color: var(--text-primary) !important; }
    .theme-text-secondary { color: var(--text-secondary) !important; }
    .theme-border { border-color: var(--border-color) !important; }

    /* Input styles */
    .theme-input {
      background-color: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-color) !important;
    }

    /* Icon visibility */
    #icon-light { display: none; }
    #icon-dark { display: none; }
    
    :not(.dark-mode) #icon-light { display: block; }
    .dark-mode #icon-dark { display: block; }

    /* Loading spinner */
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #2563eb;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    
    .dark-mode .spinner {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-left-color: #3b82f6;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body class="min-h-screen">
  <header class="p-6 text-center">
    <div class="flex justify-center items-center gap-4">
      <h1 class="text-3xl font-bold mb-2 theme-text">The Ultimate Developer & Creator Hub</h1>
      <button id="theme-toggle" type="button"
              class="p-2 rounded-md theme-button hover:opacity-80 transition">
        <!-- SUN -->
        <svg id="icon-light" class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM3.515 4.929a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM17.657 19.071a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM2 12a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm18 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4.929 17.657a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM16.364 5.636a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z"/>
        </svg>
        <!-- MOON -->
        <svg id="icon-dark" class="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.64 13.5A7.96 7.96 0 0112 20a8.08 8.08 0 01-8.2-8 8.08 8.08 0 018.2-8 7.96 7.96 0 019.64 6.5z"/>
        </svg>
      </button>
    </div>
    <p class="theme-text-secondary">Tools, Courses, and Resources for Developers, Designers, and Musicians</p>
    <p id="visitor-count" class="text-sm theme-text-secondary mt-2"></p>
  </header>

  <section class="max-w-7xl mx-auto px-4">
    <!-- TOP CATEGORY BUTTONS -->
    <div class="flex flex-wrap justify-center gap-2 mb-6" id="main-filters">
      <button data-type="All" class="type-btn px-4 py-2 rounded-md font-semibold theme-button-active">All</button>
      <button data-type="AI Tool" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">AI Tools</button>
      <button data-type="IDE" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Dev IDEs</button>
      <button data-type="Dev Course" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Dev Courses</button>
      <button data-type="Dev Website" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Dev Websites</button>
      <button data-type="Dev YouTube" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Dev YouTube</button>
      <button data-type="Graphics Program" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Graphics Programs</button>
      <button data-type="Graphics Utility" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Graphics Utilities</button>
      <button data-type="Graphics Course" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Graphics Courses</button>
      <button data-type="Graphics YouTube" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Graphics YouTube</button>
      <button data-type="Music Production DAWs" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Music Production DAWs</button>
      <button data-type="Music Production VSTs" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Music Production VSTs</button>
      <button data-type="Music Samples" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Music Samples</button>
      <button data-type="Music Production Courses" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Music Production Courses</button>
      <button data-type="Music Production Websites" class="type-btn px-4 py-2 rounded-md font-semibold theme-button">Music Production Websites</button>
    </div>

    <!-- SECONDARY FILTERS -->
    <div class="flex flex-col md:flex-row md:flex-wrap gap-4 mb-6 md:items-end p-4 rounded-lg theme-filter">
      <!-- Price -->
      <div id="price-filter-container">
        <label class="text-sm font-medium theme-text-secondary">Price</label>
        <div class="flex gap-2 mt-1">
          <button data-tier="0" class="tier-btn px-3 py-1 rounded-md font-semibold theme-button-active">All</button>
          <button data-tier="1" class="tier-btn px-3 py-1 rounded-md font-semibold theme-button">Free</button>
          <button data-tier="2" class="tier-btn px-3 py-1 rounded-md font-semibold theme-button">Freemium</button>
          <button data-tier="3" class="tier-btn px-3 py-1 rounded-md font-semibold theme-button">Paid</button>
        </div>
      </div>

      <!-- Course Category Filter -->
      <div id="course-category-filter-container" class="hidden">
        <label class="text-sm font-medium theme-text-secondary">Course Type</label>
        <div id="course-category-filters" class="flex flex-wrap gap-x-4 gap-y-2 mt-1">
          <!-- Checkboxes will be populated here -->
        </div>
      </div>

      <!-- Website Category Filter -->
      <div id="website-category-filter-container" class="hidden">
        <label class="text-sm font-medium theme-text-secondary">Website Type</label>
        <div id="website-category-filters" class="flex flex-wrap gap-x-4 gap-y-2 mt-1">
          <!-- Checkboxes will be populated here -->
        </div>
      </div>

      <!-- Platform -->
      <div id="platform-filter-container" class="hidden">
        <label class="text-sm font-medium theme-text-secondary">Platform</label>
        <div id="platform-filters" class="flex flex-wrap gap-x-4 gap-y-2 mt-1"></div>
      </div>

      <!-- Language -->
      <div id="lang-filter-container" class="hidden">
        <label class="text-sm font-medium theme-text-secondary">Language</label>
        <div id="lang-filters" class="flex flex-wrap gap-x-4 gap-y-2 mt-1"></div>
      </div>

      <!-- Sort -->
      <div id="sort-container">
        <label for="sort-by" class="text-sm font-medium theme-text-secondary">Sort By</label>
        <select id="sort-by" class="mt-1 w-full md:w-auto rounded px-3 py-1 theme-input focus:border-blue-500 focus:ring-0">
          <option value="default">Default</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="popularity_desc" class="sort-option-pop hidden">Popularity (High-Low)</option>
          <option value="subs_desc" class="sort-option-yt hidden">Subscribers (High-Low)</option>
        </select>
      </div>

      <!-- Search -->
      <div class="flex-1 min-w-[200px]">
        <label for="search" class="text-sm font-medium theme-text-secondary">Search</label>
        <input id="search" type="text" placeholder="Search…" class="w-full rounded px-3 py-1 theme-input mt-1 focus:border-blue-500 focus:ring-0"/>
      </div>
    </div>

    <!-- RESULTS & GRID -->
    <div id="results-count" class="font-semibold theme-text mb-4"></div>
    <div id="loading" class="hidden">
      <div class="spinner"></div>
      <p class="text-center theme-text mt-2">Loading tools...</p>
    </div>
    <div id="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"></div>
    <div id="pagination-controls" class="flex justify-center items-center gap-2 mt-8 pb-8"></div>
  </section>

  <script>
    // Global variable to store all tools data
    let allTools = [];

    // Simple and reliable theme toggle
    function initializeTheme() {
      // Check current theme
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
      
      // Apply theme
      if (isDark) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
      
      // Set up toggle button
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', function() {
          const isCurrentlyDark = document.documentElement.classList.contains('dark-mode');
          
          if (isCurrentlyDark) {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
          } else {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
          }
        });
      }
    }

    // Fetch data from tools.json
    async function fetchToolsData() {
      try {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('grid').classList.add('hidden');
        
        const response = await fetch('tools.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        allTools = await response.json();
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('grid').classList.remove('hidden');
        
        // Initialize filters and display after data is loaded
        initializeFilters();
        filterAndDisplayItems();
      } catch (error) {
        console.error('Error fetching tools data:', error);
        document.getElementById('loading').innerHTML = `
          <p class="text-center theme-text">Error loading tools data. Please check if tools.json exists.</p>
        `;
      }
    }

    // Filter and display functions
    function filterAndDisplayItems() {
      if (allTools.length === 0) return;
      
      const searchTerm = document.getElementById('search').value.toLowerCase();
      const selectedType = document.querySelector('.type-btn.theme-button-active')?.dataset.type || 'All';
      const selectedTier = document.querySelector('.tier-btn.theme-button-active')?.dataset.tier || '0';
      const sortBy = document.getElementById('sort-by').value;
      
      let filteredItems = allTools.filter(item => {
        // Type filter
        const typeMatch = selectedType === 'All' || item.type === selectedType;
        
        // Tier filter
        const tierMatch = selectedTier === '0' || item.tier.toString() === selectedTier;
        
        // Search filter
        const searchMatch = !searchTerm || 
          item.name.toLowerCase().includes(searchTerm) || 
          (item.description && item.description.toLowerCase().includes(searchTerm));
        
        return typeMatch && tierMatch && searchMatch;
      });
      
      // Sort items
      if (sortBy !== 'default') {
        filteredItems.sort((a, b) => {
          switch(sortBy) {
            case 'name_asc':
              return a.name.localeCompare(b.name);
            case 'name_desc':
              return b.name.localeCompare(a.name);
            case 'popularity_desc':
              return (b.popularity || 0) - (a.popularity || 0);
            case 'subs_desc':
              return (b.subscribers || 0) - (a.subscribers || 0);
            default:
              return 0;
          }
        });
      }
      
      // Update results count
      document.getElementById('results-count').textContent = 
        `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} found`;
      
      // Display items
      displayItems(filteredItems);
    }

    function displayItems(items) {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      
      if (items.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center theme-text">No items found matching your criteria.</p>';
        return;
      }
      
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'theme-card rounded-lg shadow p-4 border theme-border h-full flex flex-col';
        
        // Build card content based on available data
        let cardContent = `
          <h3 class="font-bold text-lg theme-text">${item.name}</h3>
          <p class="text-sm theme-text-secondary mt-1">${item.type}</p>
        `;
        
        if (item.description) {
          cardContent += `<p class="theme-text mt-2 flex-grow">${item.description}</p>`;
        }
        
        // Add additional fields if available
        if (item.url) {
          cardContent += `<a href="${item.url}" target="_blank" class="text-blue-500 hover:underline mt-2 block">Visit Website</a>`;
        }
        
        if (item.platforms && item.platforms.length > 0) {
          cardContent += `<p class="text-xs theme-text-secondary mt-2">Platforms: ${item.platforms.join(', ')}</p>`;
        }
        
        cardContent += `
          <div class="mt-3 flex justify-between items-center">
            <span class="text-xs px-2 py-1 rounded theme-button">${getTierText(item.tier)}</span>
            ${item.popularity ? `<span class="text-xs theme-text-secondary">Popularity: ${item.popularity}</span>` : ''}
          </div>
        `;
        
        card.innerHTML = cardContent;
        grid.appendChild(card);
      });
    }

    function getTierText(tier) {
      switch(tier) {
        case 1: return 'Free';
        case 2: return 'Freemium';
        case 3: return 'Paid';
        default: return 'Unknown';
      }
    }

    // Initialize filters and event listeners
    function initializeFilters() {
      // Type filter buttons
      document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.type-btn').forEach(b => b.classList.replace('theme-button-active', 'theme-button'));
          this.classList.replace('theme-button', 'theme-button-active');
          filterAndDisplayItems();
        });
      });
      
      // Tier filter buttons
      document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.tier-btn').forEach(b => b.classList.replace('theme-button-active', 'theme-button'));
          this.classList.replace('theme-button', 'theme-button-active');
          filterAndDisplayItems();
        });
      });
      
      // Search input
      document.getElementById('search').addEventListener('input', filterAndDisplayItems);
      
      // Sort select
      document.getElementById('sort-by').addEventListener('change', filterAndDisplayItems);
    }

    // Initialize everything when page loads
    document.addEventListener('DOMContentLoaded', function() {
      initializeTheme();
      fetchToolsData(); // Fetch data from tools.json
    });
  </script>
</body>
</html>