const SUPABASE_URL = "https://ggqifkbdinqwirsdzaxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Q4pHdDuda-gw5247bKWFQg_l1sM1DE8";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  const error = new Error("SupabaseのJavaScriptライブラリを読み込めませんでした。");
  console.error("Supabaseライブラリの読み込みに失敗しました。", error);
  window.alert("データベースライブラリを読み込めませんでした。通信環境を確認してください。");
  throw error;
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);

let recipes = [];
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
  throw new Error("画面に必要なレシピ一覧、検索欄、登録フォーム、詳細画面が見つかりません。");
}

const noResultsMessage = document.createElement("p");
noResultsMessage.textContent = "条件に一致するレシピが見つかりません";
noResultsMessage.setAttribute("role", "status");
noResultsMessage.hidden = true;
recipeList.after(noResultsMessage);

function reportDatabaseError(action, error) {
  const details =
    error && error.message ? error.message : String(error);
  console.error(`${action}に失敗しました。`, error);
  window.alert(`${action}に失敗しました。\n${details}`);
}

function normalizeText(text) {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\u30A1-\u30F6]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60),
    );
}

function findRecipeById(recipeId) {
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    throw new Error(`ID ${recipeId} のレシピが見つかりません。`);
  }

  return recipe;
}

function openRecipeDetails(recipe) {
  selectedRecipeId = recipe.id;
  recipeDetailTitle.textContent = recipe.title;
  recipeDetailCategory.textContent = `カテゴリー：${recipe.category}`;
  recipeDetailTime.textContent = recipe.time
    ? `調理時間：${recipe.time}分`
    : "調理時間：未入力";
  recipeDetailIngredients.textContent =
    recipe.ingredients || "材料は登録されていません。";
  recipeDetailInstructions.textContent =
    recipe.steps || "調理手順は登録されていません。";
  recipeDetailDialog.showModal();
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
  card.setAttribute("aria-label", `${recipe.title}の詳細を表示`);
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
  image.setAttribute("aria-label", `${recipe.title}のイメージ`);
  image.textContent = "🍽️";

  const title = document.createElement("h3");
  title.textContent = recipe.title;

  const category = document.createElement("p");
  category.textContent = `カテゴリー：${recipe.category}`;

  const cookingTime = document.createElement("p");
  cookingTime.textContent = recipe.time
    ? `調理時間：${recipe.time}分`
    : "調理時間：未入力";

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";

  function updateFavoriteButton() {
    favoriteButton.textContent = recipe.is_favorite ? "★" : "☆";
    favoriteButton.setAttribute("aria-pressed", String(recipe.is_favorite));
    favoriteButton.setAttribute(
      "aria-label",
      recipe.is_favorite
        ? `${recipe.title}のお気に入りを解除する`
        : `${recipe.title}をお気に入りにする`,
    );
  }

  favoriteButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    favoriteButton.disabled = true;

    try {
      const { data, error } = await supabaseClient
        .from("recipes")
        .update({ is_favorite: !recipe.is_favorite })
        .eq("id", recipe.id)
        .select("id");

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("更新対象が見つからないか、更新権限がありません。");
      }

      const refreshed = await loadRecipes();
      if (!refreshed) {
        favoriteButton.disabled = false;
      }
    } catch (error) {
      favoriteButton.disabled = false;
      reportDatabaseError("お気に入りの更新", error);
    }
  });
  updateFavoriteButton();

  card.append(image, title, category, cookingTime, favoriteButton);
  return card;
}

function renderRecipes() {
  const keyword = normalizeText(searchInput.value.trim());
  const selectedCategory = categoryFilter.value;

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesKeyword = normalizeText(recipe.title).includes(keyword);
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

async function loadRecipes() {
  try {
    const { data, error } = await supabaseClient
      .from("recipes")
      .select(
        "id, title, category, time, ingredients, steps, is_favorite, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      reportDatabaseError("レシピの読み込み", error);
      return false;
    }

    if (!Array.isArray(data)) {
      throw new Error("レシピデータを一覧として読み込めませんでした。");
    }

    recipes = data;
    renderRecipes();
    return true;
  } catch (error) {
    reportDatabaseError("レシピの読み込み", error);
    return false;
  }
}

async function saveRecipe(event) {
  event.preventDefault();

  const formData = new FormData(recipeForm);
  const title = String(formData.get("name") || "").trim();

  if (!title) {
    recipeNameInput.value = "";
    recipeNameInput.reportValidity();
    return;
  }

  const cookingTimeValue = String(formData.get("cookingTime") || "");
  const recipeValues = {
    title,
    category: String(formData.get("category") || "その他"),
    time: cookingTimeValue ? Number(cookingTimeValue) : null,
    ingredients: String(formData.get("ingredients") || "").trim(),
    steps: String(formData.get("instructions") || "").trim(),
  };

  try {
    if (editingRecipeId === null) {
      const { error } = await supabaseClient
        .from("recipes")
        .insert({ ...recipeValues, is_favorite: false });

      if (error) {
        throw error;
      }
    } else {
      const { data, error } = await supabaseClient
        .from("recipes")
        .update(recipeValues)
        .eq("id", editingRecipeId)
        .select("id");

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("更新対象が見つからないか、更新権限がありません。");
      }
    }

    resetRecipeForm();
    searchInput.value = "";
    categoryFilter.value = "";
    recipeDialog.close();
    selectedRecipeId = null;
    await loadRecipes();
  } catch (error) {
    reportDatabaseError(
      editingRecipeId === null ? "レシピの登録" : "レシピの更新",
      error,
    );
  }
}

async function deleteSelectedRecipe() {
  let recipe;

  try {
    recipe = findRecipeById(selectedRecipeId);
  } catch (error) {
    reportDatabaseError("レシピの削除", error);
    return;
  }

  if (!window.confirm(`「${recipe.title}」を削除しますか？`)) {
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("recipes")
      .delete()
      .eq("id", recipe.id)
      .select("id");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("削除対象が見つからないか、削除権限がありません。");
    }

    selectedRecipeId = null;
    recipeDetailDialog.close();
    await loadRecipes();
  } catch (error) {
    reportDatabaseError("レシピの削除", error);
  }
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
recipeDialog.addEventListener("cancel", resetRecipeForm);

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
  recipeNameInput.value = recipe.title;
  recipeCategoryInput.value = recipe.category;
  recipeTimeInput.value = recipe.time ?? "";
  recipeIngredientsInput.value = recipe.ingredients || "";
  recipeInstructionsInput.value = recipe.steps || "";
  setRecipeFormMode(true);

  recipeDetailDialog.close();
  selectedRecipeId = null;
  recipeDialog.showModal();
});

deleteRecipeButton.addEventListener("click", deleteSelectedRecipe);
recipeForm.addEventListener("submit", saveRecipe);

loadRecipes();
