const searchBtn = document.getElementById("searchBtn");
const ingredientInput = document.getElementById("ingredientInput");
const recommendedList = document.getElementById("recommendedList");

const apiKey = "634368ce1ea241658a7540e0124131c7"; 

searchBtn.addEventListener("click", () =>{
    const ingredient = ingredientInput.value.trim();
    if (ingredient) {
        window.location.href = `search.html?q=${encodeURIComponent(ingredient)}`;
    }
});

//load random meal
window.addEventListener("DOMContentLoaded", loadRecommendedMeals);

async function loadRecommendedMeals(){
    const sunnahFoods = ["dates", "honey", "milk", "barley", "olive oil"];
    const randomIngredients = [];

    while (randomIngredients.length < 3){
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

        if (data.code === 402){
            recommendedList.innerHTML = "<p style='text-align:center;'>API limit reached. Try again tomorrow.</p>";
            return;
        }

        if (Array.isArray(data) && data.length>0){
            allMeals.push(...data.slice(0, 1));
        }
        }

        displayRecommended(allMeals);
    } catch (err){
        console.error("Error loading recommended meals:", err);
        recommendedList.innerHTML = "<p style='text-align:center;'>Unable to load recommendations.</p>";
    }
}

function displayRecommended(recipes){
    recommendedList.innerHTML = "";
    recipes.forEach(recipe =>{
        const mainIngredients = recipe.usedIngredients.map(i => i.name).join(", ");
        // Use getSubstitute from substitutes.js for the first used ingredient (or show a combined list)
        const substitutesList = recipe.usedIngredients.map(i=>{
        return `${i.name} → ${getSubstitute(i.name)}`;
        }).join("; ");

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <p><b>Main Ingredient:</b> ${mainIngredients}</p>
        <p><b>Sunnah Substitute:</b> ${substitutesList}</p>
        <button onclick="addToMealPlan('${escapeHtml(recipe.title)}', '${escapeHtml(recipe.image)}')">Add to Meal Plan</button>
        `;
        recommendedList.appendChild(card);
    });
}

function addToMealPlan(title, image){
  let mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || [];
  mealPlan.push({ title, image, day: "Not assigned" });
  localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
  alert("Recipe added to your meal plan!");
}

function escapeHtml(str){
    if (typeof str !== "string") return str;
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
