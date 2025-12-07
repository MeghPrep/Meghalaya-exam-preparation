// ===================================
// PAGE NAVIGATION
// ===================================

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageId);
    page.classList.toggle('fade-in', page.id === pageId);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  showPage('homePage');

  renderCategories('practiceCategoryList');
  renderCategories('mockCategoryList');
});

let currentMode = "";
let currentCategory = null;
let currentSubcategory = null;

function setMode(mode) {
  currentMode = mode;
}

function goBackFromSubcategory() {
  if (currentMode === "practice") showPage('practicePage');
  else if (currentMode === "mock") showPage('mockPage');
}



// ===================================
// CATEGORY RENDER (TREE)
// ===================================

function renderCategories(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  QUIZ_TREE.forEach(cat => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${cat.name}</h3>
      <p>${cat.desc}</p>
    `;
    div.onclick = () => {
      setMode(containerId === 'practiceCategoryList' ? 'practice' : 'mock');
      currentCategory = cat;
      renderSubcategories(cat);
    };
    container.appendChild(div);
  });
}



// ===================================
// SUBCATEGORIES (TREE)
// ===================================

function renderSubcategories(category) {
  const container = document.getElementById('subCategoryList');
  container.innerHTML = "";

  const subs = category.subcategories || [];

  subs.forEach(sub => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${sub.name}</h3>
      <p>${sub.desc}</p>
    `;
    div.onclick = () => {
      currentSubcategory = sub;
      renderPapers(sub);
    };
    container.appendChild(div);
  });

  showPage('subCategoryPage');
    // Push state for back navigation
  history.pushState({ page: 'subCategoryPage', categoryId: category.id }, '', '');
}


// ===================================
// PAPERS (TREE)
// ===================================

function renderPapers(subcategory) {
  const container = document.getElementById('paperList');
  const title = document.getElementById('paperPageTitle');

  container.innerHTML = "";
  title.textContent = `Select Paper – ${subcategory.name}`;

  const papers = subcategory.papers || [];

  papers.forEach(paper => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${paper.name}</h3>
      <p>${paper.desc}</p>
    `;
    div.onclick = () => {
      const years = paper.years || [];
      const items = years.map(y => ({ name: y }));

      showDropdown(`Select Year – ${paper.name}`, items, year => {
        window.location.href =
          `quiz.html?paper=${paper.id}&year=${year.name}&mode=${currentMode}`;
      });
    };
    container.appendChild(div);
  });

  showPage('paperPage');
history.pushState({ page: 'paperPage', subcategoryId: subcategory.id }, '', '');
}

window.addEventListener('popstate', event => {
  const state = event.state;
  if (!state) {
    // no state → show home
    showPage('homePage');
    currentCategory = null;
    currentSubcategory = null;
    return;
  }

  switch(state.page) {
    case 'subCategoryPage':
      const cat = QUIZ_TREE.find(c => c.id === state.categoryId);
      if (cat) renderSubcategories(cat);
      break;
    case 'paperPage':
      const sub = currentCategory?.subcategories.find(s => s.id === state.subcategoryId);
      if (sub) renderPapers(sub);
      break;
    default:
      showPage('homePage');
      break;
  }
});

// ===================================
// DROPDOWN (UNCHANGED)
// ===================================

function showDropdown(title, items, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'dropdown-overlay';

  overlay.innerHTML = `
    <div class="dropdown-box">
      <h2>${title}</h2>
      <div id="dropdownItems"></div>
      <button id="closeDropdown">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const container = overlay.querySelector('#dropdownItems');

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = item.name;

    div.onclick = () => {
      callback(item);
      closeDropdown(overlay);
    };

    container.appendChild(div);
  });

  overlay.querySelector('#closeDropdown').onclick = () => closeDropdown(overlay);
  overlay.style.display = 'flex';
}

function closeDropdown(overlay) {
  if (overlay && overlay.parentNode) overlay.remove();
}


// Restore last section if returning from quiz.html

document.addEventListener('DOMContentLoaded', () => {
  const lastState = sessionStorage.getItem('lastQuizState');
  if (!lastState) return;

  const state = JSON.parse(lastState);
  currentMode = state.mode || "";

  if (state.categoryId) {
    currentCategory = QUIZ_TREE.find(c => c.id === state.categoryId);

    if (state.subcategoryId) {
      currentSubcategory = currentCategory.subcategories.find(s => s.id === state.subcategoryId);
      renderPapers(currentSubcategory);
    } else {
      renderSubcategories(currentCategory);
    }

    // Show proper page
    showPage(state.subcategoryId ? 'paperPage' : 'subCategoryPage');
  }

  // Clear stored state after restoring
  sessionStorage.removeItem('lastQuizState');
});