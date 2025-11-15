document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recipe-form');
  const ingredientsList = document.getElementById('ingredients-list');
  const stepsList = document.getElementById('steps-list');
  const addIngredientBtn = document.getElementById('add-ingredient');
  const addStepBtn = document.getElementById('add-step');
  const importInput = document.getElementById('import-json');

  const addIngredientField = (value = '') => {
    const div = document.createElement('div');
    div.className = 'ingredient-input';
    div.innerHTML = `
      <input type="text" name="ingredient" value="${escapeAttr(value)}" placeholder="Ex: 250 g de farine" required>
      <button type="button" class="remove-btn">×</button>
    `;
    ingredientsList.appendChild(div);
    attachRemoveListener(div);
  };

  const addStepField = (value = '') => {
    const div = document.createElement('div');
    div.className = 'step-input';
    div.innerHTML = `
      <textarea name="step" placeholder="Ex: Cuire 2 min de chaque côté" required>${escapeHtml(value)}</textarea>
      <button type="button" class="remove-btn">×</button>
    `;
    stepsList.appendChild(div);
    attachRemoveListener(div);
  };

  const attachRemoveListener = (parent) => {
    const btn = parent.querySelector('.remove-btn');
    btn.addEventListener('click', () => {
      if (
        (parent.parentNode === ingredientsList && ingredientsList.children.length > 1) ||
        (parent.parentNode === stepsList && stepsList.children.length > 1)
      ) {
        parent.remove();
      } else {
        alert("⚠️ Une recette doit contenir au moins 1 ingrédient et 1 étape.");
      }
    });
  };

  // ✅ Pré-remplir si édition
  const params = new URLSearchParams(window.location.search);
  const editingId = params.get('id');
  let editing = false;

  if (editingId !== null) {
    document.querySelector('h1').textContent = 'Modifier la recette';
    document.querySelector('.form-actions button[type="submit"]').textContent = '💾 Mettre à jour';
    editing = true;

    document.getElementById('title').value = params.get('title') || '';
    document.getElementById('category').value = params.get('category') || '';
    document.getElementById('prep-time').value = params.get('prepTime') || '';
    document.getElementById('cook-time').value = params.get('cookTime') || '';

    try {
      const ingredients = JSON.parse(params.get('ingredients') || '[]');
      const steps = JSON.parse(params.get('steps') || '[]');
      ingredientsList.innerHTML = '';
      stepsList.innerHTML = '';
      ingredients.forEach(i => addIngredientField(i));
      steps.forEach(s => addStepField(s));
    } catch (e) {
      addIngredientField();
      addStepField();
    }
  } else {
    addIngredientField();
    addStepField();
  }

  addIngredientBtn.addEventListener('click', () => addIngredientField());
  addStepBtn.addEventListener('click', () => addStepField());

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const prepTime = document.getElementById('prep-time').value || null;
    const cookTime = document.getElementById('cook-time').value || null;

    const ingredients = Array.from(
      form.querySelectorAll('input[name="ingredient"]')
    )
      .map(el => el.value.trim())
      .filter(v => v);

    const steps = Array.from(
      form.querySelectorAll('textarea[name="step"]')
    )
      .map(el => el.value.trim())
      .filter(v => v);

    if (!title || ingredients.length === 0 || steps.length === 0) {
      alert('⚠️ Titre, ingrédients et étapes obligatoires.');
      return;
    }

    const recipe = {
      title,
      category: category || null,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      ingredients,
      steps
    };

    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

    if (editing) {
      recipes[parseInt(editingId)] = recipe;
    } else {
      recipes.push(recipe);
    }

    localStorage.setItem('recipes', JSON.stringify(recipes));
    alert(editing ? '✅ Recette mise à jour !' : '✅ Recette enregistrée !');
    window.location.href = 'all-recipes.html';
  });

  // 📤 Import JSON
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (!Array.isArray(data)) {
          throw new Error("Le fichier doit être un tableau.");
        }

        const validRecipes = data.filter(recipe =>
          recipe.title &&
          Array.isArray(recipe.ingredients) &&
          Array.isArray(recipe.steps)
        );

        if (validRecipes.length === 0) {
          throw new Error("Aucune recette valide trouvée.");
        }

        const existing = JSON.parse(localStorage.getItem('recipes')) || [];
        const updated = [...existing, ...validRecipes];
        localStorage.setItem('recipes', JSON.stringify(updated));

        alert(`✅ ${validRecipes.length} recette(s) importée(s) !`);
        window.location.reload();
      } catch (err) {
        alert(`❌ Erreur : ${err.message}`);
      }
    };
    reader.readAsText(file);
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;');
  }
});