const recipes = [
  {
    name: "鮭の塩焼き定食",
    category: "和食",
    cookingTime: 25,
    image: "🍚",
    isFavorite: false,
  },
  {
    name: "トマトパスタ",
    category: "洋食",
    cookingTime: 20,
    image: "🍝",
    isFavorite: false,
  },
  {
    name: "麻婆豆腐",
    category: "中華",
    cookingTime: 30,
    image: "🥘",
    isFavorite: false,
  },
];

const recipeList = document.querySelector("#recipe-list");
const searchInput = document.querySelector("#recipe-search");
const categoryFilter = document.querySelector("#category-filter");

if (!recipeList || !searchInput || !categoryFilter) {
  throw new Error("レシピ一覧、検索欄、カテゴリー選択欄のいずれかが見つかりません。");
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

function createRecipeCard(recipe) {
  const card = document.createElement("article");
  card.classList.add("recipe-card");

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
  cookingTime.textContent = `調理時間：${recipe.cookingTime}分`;

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

  favoriteButton.addEventListener("click", () => {
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

renderRecipes();