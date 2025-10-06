const API = 'https://raw.githubusercontent.com/ai-tools-directory/ai-tools-json/main/dist/tools.json';
let json = [], cats = new Set();

const $ = s => document.querySelector(s);
const grid = $('#grid');
const catFilter = $('#catFilter');
const search = $('#search');

// initial fetch
const data = await fetch(API).then(r => r.json());
json = data;
data.forEach(t => cats.add(t.category));
[...cats].sort().forEach(c => catFilter.innerHTML += `<option>${c}</option>`);
render();

// price toggle
document.querySelectorAll('.tier-btn').forEach(btn => {
  btn.onclick = e => {
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.replace('bg-blue-600', 'bg-gray-700'));
    e.target.classList.replace('bg-gray-700', 'bg-blue-600');
    render(Number(e.target.dataset.tier));
  };
});

// category + live search
catFilter.onchange = () => render();
search.oninput = () => render();

function render(tier = 0) {
  const q = search.value.trim().toLowerCase();
  const c = catFilter.value;
  const filt = json.filter(t =>
    (tier === 0 || t.priceTier === tier) &&
    (!c || t.category === c) &&
    (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  );
  grid.innerHTML = filt.map(card).join('');
}

function card(t) {
  const badge = t.priceTier === 1 ? 'Free' : t.priceTier === 2 ? 'Freemium' : 'Paid';
  const badgeColor = t.priceTier === 1 ? 'green' : t.priceTier === 2 ? 'yellow' : 'red';
  return `
  <a href="${t.url}" target="_blank" rel="noopener" class="block rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition">
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-semibold">${t.name}</h3>
      <span class="text-xs px-2 py-0.5 rounded bg-${badgeColor}-600">${badge}</span>
    </div>
    <p class="text-sm text-gray-300 mb-2">${t.description}</p>
    ${t.benchmark ? `<p class="text-xs text-gray-400">🏆 ${t.benchmark}</p>` : ''}
    <p class="text-xs text-gray-500 mt-2">${t.category}</p>
  </a>`;
}