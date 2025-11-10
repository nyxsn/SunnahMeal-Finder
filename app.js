const searchBtn = document.getElementById("searchBtn");
const ingredientInput = document.getElementById("ingredientInput");
const recipeList = document.getElementById("recipeList");
const recommendedList = document.getElementById("recommendedList");

const apiKey = "634368ce1ea241658a7540e0124131c7";

// main program
searchBtn.addEventListener("click", ()=>{
    const ingredient = ingredientInput.value.trim();
    if (ingredient) getRecipes(ingredient);
});

// load recommended meals
window.addEventListener("DOMContentLoaded", loadRecommendedMeals);

// fetching api
async function getRecipes(ingredient){
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredient}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.code == 402){
        alert("API limit reached. Try again tomorrow or use a new API key.");
        return;
        }

        displayRecipes(data);
    } catch (err) {
        console.error("Error fetching recipes:", err);
    }
}

// display search result
function displayRecipes(recipes){
    recipeList.innerHTML = "";
    if (!recipes || !recipes.length){
        recipeList.innerHTML = "<p style='text-align:center;'>No recipes found.</p>";
        return;
    }

    recipes.forEach(recipe=>{
        const card = document.createElement("div");
        card.className = "card";

        // build used list and substitutes as pairs
        const usedNames = recipe.usedIngredients.map(i => i.name);
        const usedHtml = usedNames.join(", ");

        const substitutesHtml = recipe.usedIngredients
            .map(i => {
                const sub = getSubstitute(i.name);
                return `${i.name} → ${sub}`;
            })
            .join(", ");

        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${escapeHtml(recipe.title)}</h3>
            <p><b>Used:</b> ${escapeHtml(usedHtml)}</p>
            <p><b>Sunnah Substitute:</b> ${escapeHtml(substitutesHtml)}</p>
            <p><b>Missed:</b> ${escapeHtml(recipe.missedIngredients.map(i => i.name).join(", "))}</p>
            <button class="add-btn" data-title='${escapeAttr(recipe.title)}' data-image='${escapeAttr(recipe.image)}'>Add to Meal Plan</button>
        `;
        recipeList.appendChild(card);
    });

    // attach event listeners for all add buttons (safe, avoids inline onclick issues)
        document.querySelectorAll(".add-btn").forEach(btn=>{
        btn.addEventListener("click", () => {
            const title = btn.getAttribute("data-title");
            const image = btn.getAttribute("data-image");
            addToMealPlan(title, image);
        });
    });
}

// add meal to plan
function addToMealPlan(title, image){
    let mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || [];
    mealPlan.push({ title, image, day: "Not assigned" });
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
    alert("Recipe added to the meal plan!");
}

// pengganti ingredients
const substitutes={
    "dates": "figs",
    "honey": "date syrup",
    "olive oil": "black seed oil",
    "barley": "oats",
    "milk": "goat milk"
};

function getSubstitute(ingredient){
    ingredient = ingredient.toLowerCase();
    if (substitutes[ingredient]) return substitutes[ingredient];
        for (const key of Object.keys(substitutes)) {
            if (ingredient.includes(key)) return substitutes[key];
        }
    return "No Sunnah substitute available.";
}

// recommended meals loader
async function loadRecommendedMeals(){
    const sunnahFoods = ["dates", "honey", "milk", "barley", "olive oil"];
    const randomIngredients = [];

    while (randomIngredients.length<3){
        const pick = sunnahFoods[Math.floor(Math.random() * sunnahFoods.length)];
        if (!randomIngredients.includes(pick)) randomIngredients.push(pick);
    }

    recommendedList.innerHTML = "<p style='text-align:center;'>Loading recommended meals...</p>";

    try {
        const allMeals = [];
        for (const ingredient of randomIngredients){
            const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredient}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length) allMeals.push(...data.slice(0, 1));
        }

        displayRecommended(allMeals);
    } 
        catch (err){
        console.error("Error loading recommended meals:", err);
        recommendedList.innerHTML = "<p style='text-align:center;'>Unable to load recommendations.</p>";
    }
}

function displayRecommended(recipes){
  recommendedList.innerHTML = "";
  recipes.forEach(recipe=>{
    const mainIngredient = recipe.usedIngredients.map(i => i.name).join(", ");
    const substitutesHtml = recipe.usedIngredients
        .map(i => `${i.name} → ${getSubstitute(i.name)}`)
        .join(", ");

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${escapeHtml(recipe.title)}</h3>
        <p><b>Main Ingredient:</b> ${escapeHtml(mainIngredient)}</p>
        <p><b>Sunnah Substitute:</b> ${escapeHtml(substitutesHtml)}</p>
        <button class="add-btn" data-title='${escapeAttr(recipe.title)}' data-image='${escapeAttr(recipe.image)}'>Add to Meal Plan</button>
    `;
    recommendedList.appendChild(card);
  });

  document.querySelectorAll("#recommendedList .add-btn").forEach(btn=>{
    btn.addEventListener("click", () => {
        const title = btn.getAttribute("data-title");
        const image = btn.getAttribute("data-image");
        addToMealPlan(title, image);
    });
  });
}

function escapeHtml(text){
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(text){
    if (!text) return "";
    return String(text)
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;");
}
