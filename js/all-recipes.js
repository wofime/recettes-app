document.addEventListener('DOMContentLoaded', () => {
  const recipesList = document.getElementById('recipes-list');
  const noRecipes = document.getElementById('no-recipes');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');

  let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

  const renderRecipes = (filtered = recipes) => {
    if (filtered.length === 0) {
      noRecipes.style.display = 'block';
      recipesList.innerHTML = '';
      return;
    }
    noRecipes.style.display = 'none';
    recipesList.innerHTML = filtered.map((recipe, idx) => `
      <button class="recipe-card" data-id="${idx}">
        <h2 class="recipe-title">${escapeHtml(recipe.title)}</h2>
        <div class="recipe-summary">
          ${recipe.category ? `🏷️ ${recipe.category} • ` : ''}
          ${recipe.ingredients.length} ingrédients • 
          ${recipe.steps.length} étapes
        </div>
      </button>
    `).join('');
  };

  const filterRecipes = () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filtered = recipes.filter(r => {
      const matchesText = 
        r.title.toLowerCase().includes(query) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(query));
      const matchesCategory = 
        !category || (r.category && r.category === category);
      return matchesText && matchesCategory;
    });

    renderRecipes(filtered);
  };

  searchInput?.addEventListener('input', filterRecipes);
  categoryFilter?.addEventListener('change', filterRecipes);

  recipesList.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (!card) return;
    const id = parseInt(card.dataset.id);
    showFullscreenRecipe(recipes[id], id);
  });

  renderRecipes();

  function showFullscreenRecipe(r, id) {
    const overlay = document.createElement('div');
    overlay.id = 'fullscreen-overlay';
    overlay.innerHTML = `
      <div class="fullscreen-recipe">
        <div class="fullscreen-header">
          <h1>${escapeHtml(r.title)}</h1>
          <div class="fullscreen-actions">
            <button class="fullscreen-btn edit-btn" data-id="${id}">✏️ Modifier</button>
            <button class="fullscreen-btn delete-btn" data-id="${id}">🗑️ Supprimer</button>
          </div>
        </div>
        
        <div class="meta">
          ${r.category ? `🏷️ ${escapeHtml(r.category)} ` : ''}
          ${r.prepTime ? `⏱️ Prépa: ${r.prepTime} min ` : ''}
          ${r.cookTime ? `🔥 Cuisson: ${r.cookTime} min` : ''}
        </div>
        
        <h2>📝 Ingrédients</h2>
        <ul>${r.ingredients.map(i => `<li>• ${escapeHtml(i)}</li>`).join('')}</ul>
        
        <h2>👩‍🍳 Étapes</h2>
        <ol>${r.steps.map((s, i) => `<li>${i + 1}. ${escapeHtml(s)}</li>`).join('')}</ol>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('active'), 10);

    // ✅ Actions dans le plein écran
    overlay.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const recipe = recipes[id];
      const params = new URLSearchParams({
        id,
        title: recipe.title,
        ingredients: JSON.stringify(recipe.ingredients),
        steps: JSON.stringify(recipe.steps),
        category: recipe.category || '',
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || ''
      });
      closeOverlay(overlay);
      setTimeout(() => {
        window.location.href = `create-recipe.html?${params.toString()}`;
      }, 300);
    });

    overlay.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('⚠️ Supprimer cette recette ?\nCette action est irréversible.')) {
        recipes.splice(id, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        closeOverlay(overlay);
        setTimeout(() => renderRecipes(), 400);
      }
    });

    // ✅ Bouton ×
    const header = overlay.querySelector('.fullscreen-header');
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => closeOverlay(overlay);
    header.appendChild(closeBtn);

    overlay.onclick = (e) => {
      if (e.target === overlay) closeOverlay(overlay);
    };
  }

  function closeOverlay(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>');
  }
});