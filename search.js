const recipeList = document.getElementById("recipeList");
const apiKey = "634368ce1ea241658a7540e0124131c7";

const urlParams = new URLSearchParams(window.location.search);
const ingredient = urlParams.get("q");

const searchTitle = document.getElementById("searchTitle");

if (ingredient){
    searchTitle.innerHTML = `Search Results : <span style="color:#006d6d; text-transform:capitalize;">${ingredient}</span>`;
    getRecipes(ingredient);
    } 
else{
    searchTitle.innerHTML = "Search Results ";
}

async function getRecipes(ingredient){
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredient}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.code == 402){
        recipeList.innerHTML = "<p style='text-align:center;'>API limit reached. Please try again tomorrow.</p>";
        return;
        }

        displayRecipes(data);
    } 
    catch (err) {
        console.error("Error fetching recipes:", err);
        recipeList.innerHTML = "<p style='text-align:center;'>Error loading recipes.</p>";
    }
}

function getSubstitute(ingredient){
    const substitutes={
        "dates": "figs",
        "honey": "date syrup",
        "olive oil": "black seed oil",
        "barley": "oats",
        "milk": "goat milk"
    };
    ingredient = ingredient.toLowerCase();
    if (substitutes[ingredient]) return substitutes[ingredient];
    for (const key of Object.keys(substitutes)){
        if (ingredient.includes(key)) return substitutes[key];
    }
    return "No Sunnah substitute available.";
}

function displayRecipes(recipes){
    recipeList.innerHTML = "";
    if (!recipes || !recipes.length){
        recipeList.innerHTML = "<p style='text-align:center;'>No recipes found for your search.</p>";
        return;
    }

    recipes.forEach(recipe=>{
        const usedHtml = recipe.usedIngredients.map(i => i.name).join(", ");
        const substitutesHtml = recipe.usedIngredients
        .map(i => `${i.name} → ${getSubstitute(i.name)}`)
        .join(", ");

        const card = document.createElement("div");
        card.className = "card";
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

    document.querySelectorAll(".add-btn").forEach(btn =>{
        btn.addEventListener("click", () => {
        const title = btn.getAttribute("data-title");
        const image = btn.getAttribute("data-image");
        let mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || [];
        mealPlan.push({ title, image, day: "Not assigned" });
        localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
        alert("Recipe added to the meal plan!");
        });
    });
}

function escapeHtml(text){
    if (!text) return "";
    return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escapeAttr(text){
    if (!text) return "";
    return String(text).replace(/'/g,"&#39;").replace(/"/g,"&quot;");
}
