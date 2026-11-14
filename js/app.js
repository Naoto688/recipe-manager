const recipes = [
  {
    id: 1,
    name: "鮭の塩焼き定食",
    category: "和食",
    cookingTime: 25,
    ingredients: "鮭の切り身 1切れ\n塩 少々\nごはん 1膳",
    instructions: "鮭に塩をふり、10分ほど置く。\n魚焼きグリルで両面を焼く。",
    image: "🍚",
    isFavorite: false,
  },
  {
    id: 2,
    name: "トマトパスタ",
    category: "洋食",
    cookingTime: 20,
    ingredients: "スパゲッティ 100g\nトマトソース 150g\nオリーブオイル 大さじ1",
    instructions: "スパゲッティをゆでる。\nフライパンでトマトソースを温め、麺とあえる。",
    image: "🍝",
    isFavorite: false,
  },
  {
    id: 3,
    name: "麻婆豆腐",
    category: "中華",
    cookingTime: 30,
    ingredients: "豆腐 1丁\n豚ひき肉 100g\n麻婆豆腐の素 1袋",
    instructions: "豆腐を食べやすい大きさに切る。\nひき肉を炒め、豆腐と麻婆豆腐の素を加えて煮る。",
    image: "🥘",
    isFavorite: false,
  },
];

let nextRecipeId = recipes.length + 1;
let editingRecipeId = null;
let selectedRecipeId = null;

const recipeList = document.querySelector("#recipe-list");
const searchInput = document.querySelector("#recipe-search");
const categoryFilter = document.querySelector("#category-filter");
const recipeDialog = document.querySelector("#recipe-dialog");
const openRecipeFormButton = document.querySelector("#open-recipe-form");
const closeRecipeFormButton = document.querySelector("#close-recipe-form");
const cancelRecipeFormButton = document.querySelector("#cancel-recipe-form");
const recipeForm = document.querySelector("#recipe-form");
const recipeNameInput = document.querySelector("#new-recipe-name");
const recipeCategoryInput = document.querySelector("#new-recipe-category");
const recipeTimeInput = document.querySelector("#new-recipe-time");
const recipeIngredientsInput = document.querySelector(
  "#new-recipe-ingredients",
);
const recipeInstructionsInput = document.querySelector(
  "#new-recipe-instructions",
);
const recipeDialogTitle = document.querySelector("#recipe-dialog-title");
const submitRecipeFormButton = document.querySelector("#submit-recipe-form");
const recipeDetailDialog = document.querySelector("#recipe-detail-dialog");
const closeRecipeDetailsButton = document.querySelector(
  "#close-recipe-details",
);
const editRecipeButton = document.querySelector("#edit-recipe");
const deleteRecipeButton = document.querySelector("#delete-recipe");
const recipeDetailTitle = document.querySelector("#recipe-detail-title");
const recipeDetailCategory = document.querySelector("#recipe-detail-category");
const recipeDetailTime = document.querySelector("#recipe-detail-time");
const recipeDetailIngredients = document.querySelector(
  "#recipe-detail-ingredients",
);
const recipeDetailInstructions = document.querySelector(
  "#recipe-detail-instructions",
);

if (
  !recipeList ||
  !searchInput ||
  !categoryFilter ||
  !recipeDialog ||
  !openRecipeFormButton ||
  !closeRecipeFormButton ||
  !cancelRecipeFormButton ||
  !recipeForm ||
  !recipeNameInput ||
  !recipeCategoryInput ||
  !recipeTimeInput ||
  !recipeIngredientsInput ||
  !recipeInstructionsInput ||
  !recipeDialogTitle ||
  !submitRecipeFormButton ||
  !recipeDetailDialog ||
  !closeRecipeDetailsButton ||
  !editRecipeButton ||
  !deleteRecipeButton ||
  !recipeDetailTitle ||
  !recipeDetailCategory ||
  !recipeDetailTime ||
  !recipeDetailIngredients ||
  !recipeDetailInstructions
) {
  throw new Error("レシピ一覧、検索欄、登録フォーム、詳細画面のいずれかが見つかりません。");
}

const noResultsMessage = document.createElement("p");
noResultsMessage.textContent = "条件に一致するレシピが見つかりません";
noResultsMessage.setAttribute("role", "status");
noResultsMessage.hidden = true;
recipeList.after(noResultsMessage);

function normalizeText(text) {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\u30A1-\u30F6]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60),
    );
}

function openRecipeDetails(recipe) {
  selectedRecipeId = recipe.id;
  recipeDetailTitle.textContent = recipe.name;
  recipeDetailCategory.textContent = `カテゴリー：${recipe.category}`;
  recipeDetailTime.textContent = recipe.cookingTime
    ? `調理時間：${recipe.cookingTime}分`
    : "調理時間：未入力";
  recipeDetailIngredients.textContent =
    recipe.ingredients || "材料は登録されていません。";
  recipeDetailInstructions.textContent =
    recipe.instructions || "調理手順は登録されていません。";
  recipeDetailDialog.showModal();
}

function findRecipeById(recipeId) {
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    throw new Error(`ID ${recipeId} のレシピが見つかりません。`);
  }

  return recipe;
}

function setRecipeFormMode(isEditing) {
  recipeDialogTitle.textContent = isEditing
    ? "レシピを編集"
    : "新規レシピ登録";
  submitRecipeFormButton.textContent = isEditing ? "変更を保存" : "登録する";
}

function resetRecipeForm() {
  recipeForm.reset();
  editingRecipeId = null;
  setRecipeFormMode(false);
}

function openNewRecipeForm() {
  resetRecipeForm();
  recipeDialog.showModal();
}

function createRecipeCard(recipe) {
  const card = document.createElement("article");
  card.classList.add("recipe-card");
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${recipe.name}の詳細を表示`);
  card.addEventListener("click", () => {
    openRecipeDetails(recipe);
  });
  card.addEventListener("keydown", (event) => {
    if (
      event.target === card &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      openRecipeDetails(recipe);
    }
  });

  const image = document.createElement("div");
  image.classList.add("recipe-image");
  image.setAttribute("role", "img");
  image.setAttribute("aria-label", `${recipe.name}のイメージ`);
  image.textContent = recipe.image;

  const name = document.createElement("h3");
  name.textContent = recipe.name;

  const category = document.createElement("p");
  category.textContent = `カテゴリー：${recipe.category}`;

  const cookingTime = document.createElement("p");
  cookingTime.textContent = recipe.cookingTime
    ? `調理時間：${recipe.cookingTime}分`
    : "調理時間：未入力";

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";

  function updateFavoriteButton() {
    favoriteButton.textContent = recipe.isFavorite ? "★" : "☆";
    favoriteButton.setAttribute("aria-pressed", String(recipe.isFavorite));
    favoriteButton.setAttribute(
      "aria-label",
      recipe.isFavorite
        ? `${recipe.name}のお気に入りを解除する`
        : `${recipe.name}をお気に入りにする`,
    );
  }

  favoriteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    recipe.isFavorite = !recipe.isFavorite;
    updateFavoriteButton();
  });
  updateFavoriteButton();

  card.append(image, name, category, cookingTime, favoriteButton);
  return card;
}

function renderRecipes() {
  const keyword = normalizeText(searchInput.value.trim());
  const selectedCategory = categoryFilter.value;

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesKeyword = normalizeText(recipe.name).includes(keyword);
    const matchesCategory =
      selectedCategory === "" || recipe.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  recipeList.textContent = "";
  noResultsMessage.hidden = filteredRecipes.length > 0;

  filteredRecipes.forEach((recipe) => {
    recipeList.append(createRecipeCard(recipe));
  });
}

searchInput.addEventListener("input", renderRecipes);
categoryFilter.addEventListener("change", renderRecipes);

openRecipeFormButton.addEventListener("click", openNewRecipeForm);

function closeRecipeForm() {
  resetRecipeForm();
  recipeDialog.close();
}

closeRecipeFormButton.addEventListener("click", closeRecipeForm);
cancelRecipeFormButton.addEventListener("click", closeRecipeForm);
recipeDialog.addEventListener("cancel", () => {
  resetRecipeForm();
});

closeRecipeDetailsButton.addEventListener("click", () => {
  recipeDetailDialog.close();
});

recipeDetailDialog.addEventListener("click", (event) => {
  if (event.target === recipeDetailDialog) {
    recipeDetailDialog.close();
  }
});

editRecipeButton.addEventListener("click", () => {
  const recipe = findRecipeById(selectedRecipeId);
  editingRecipeId = recipe.id;
  recipeNameInput.value = recipe.name;
  recipeCategoryInput.value = recipe.category;
  recipeTimeInput.value = recipe.cookingTime ?? "";
  recipeIngredientsInput.value = recipe.ingredients;
  recipeInstructionsInput.value = recipe.instructions;
  setRecipeFormMode(true);

  recipeDetailDialog.close();
  selectedRecipeId = null;
  recipeDialog.showModal();
});

deleteRecipeButton.addEventListener("click", () => {
  const recipe = findRecipeById(selectedRecipeId);
  const shouldDelete = window.confirm(`「${recipe.name}」を削除しますか？`);

  if (!shouldDelete) {
    return;
  }

  const recipeIndex = recipes.findIndex((item) => item.id === selectedRecipeId);
  recipes.splice(recipeIndex, 1);
  selectedRecipeId = null;
  recipeDetailDialog.close();
  renderRecipes();
});

recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(recipeForm);
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    recipeNameInput.value = "";
    recipeNameInput.reportValidity();
    return;
  }

  const cookingTimeValue = String(formData.get("cookingTime") || "");
  const updatedValues = {
    name,
    category: String(formData.get("category") || "その他"),
    cookingTime: cookingTimeValue ? Number(cookingTimeValue) : null,
    ingredients: String(formData.get("ingredients") || "").trim(),
    instructions: String(formData.get("instructions") || "").trim(),
  };

  if (editingRecipeId === null) {
    recipes.unshift({
      id: nextRecipeId,
      ...updatedValues,
      image: "🍽️",
      isFavorite: false,
    });
    nextRecipeId += 1;
  } else {
    const recipe = findRecipeById(editingRecipeId);
    recipe.name = updatedValues.name;
    recipe.category = updatedValues.category;
    recipe.cookingTime = updatedValues.cookingTime;
    recipe.ingredients = updatedValues.ingredients;
    recipe.instructions = updatedValues.instructions;
  }

  resetRecipeForm();
  searchInput.value = "";
  categoryFilter.value = "";
  recipeDialog.close();
  selectedRecipeId = null;
  renderRecipes();
});

renderRecipes();