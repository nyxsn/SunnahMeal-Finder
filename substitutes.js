const substitutes={
  "dates": "figs",
  "honey": "date syrup",
  "olive oil": "black seed oil",
  "barley": "oats",
  "milk": "goat milk"
};

function getSubstitute(ingredient){
    if (!ingredient) return "No Sunnah substitute available.";
    ingredient = ingredient.toLowerCase().trim();
    if (substitutes[ingredient]) return substitutes[ingredient];
    for (const key of Object.keys(substitutes)) {
        if (ingredient.includes(key)) return substitutes[key];
    }
    return "No Sunnah substitute available.";
}
