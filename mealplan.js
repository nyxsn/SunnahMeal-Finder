const mealContainer = document.getElementById("mealContainer");
let mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || [];

function renderMealPlan(){
    mealContainer.innerHTML = "";
    mealPlan.forEach((meal, index) =>{
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${meal.image}" alt="${meal.title}">
            <h3>${meal.title}</h3>
            <p>Day: <input type="text" id="day-${index}" value="${meal.day}"></p>
            <button onclick="updateMeal(${index})">Update</button>
            <button onclick="deleteMeal(${index})">Delete</button>
        `;
        mealContainer.appendChild(card);
    });
}

function updateMeal(index){
    const newDay = document.getElementById(`day-${index}`).value;
    mealPlan[index].day = newDay;
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
    alert("Meal updated!");
}

function deleteMeal(index){
    mealPlan.splice(index, 1);
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
    renderMealPlan();
    alert("Meal removed.");
}

renderMealPlan();

