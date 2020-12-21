const { loadAndTransform, sets } = require('../../helpers');

let ingredientDetails = new Map();
let allergenRecipes = new Map();

let recipes = loadAndTransform('input.txt', '\n', (line, idx) => {
        let [ingredients, allergens] = line.split(' (contains');

        allergens = allergens.trim()
            .substring(0, allergens.length - 2)
            .split(', ');

        ingredients = ingredients.trim()
            .split(' ');

        // ensure mapping of allergen to recipes exists
        allergens.forEach((allergen) => {
            if(!allergenRecipes.has(allergen)) {
                allergenRecipes.set(allergen, []);
            }
            allergenRecipes.get(allergen).push(idx);
        });

        // ensure mapping of ingredient data
        ingredients.forEach((ingredient) => {
            if(!ingredientDetails.has(ingredient)) {
                ingredientDetails.set(ingredient, {
                    allergen: null,
                    recipes: []
                });
            }
            ingredientDetails.get(ingredient).recipes.push(idx);
        });

        return {
            id: idx,
            ingredients: ingredients,
            allergens: allergens
        }
    })
    .reduce((recipes, recipe) => {
        recipes.set(recipe.id, recipe);
        return recipes;
    }, new Map());

let toProcess = [...allergenRecipes.keys()];
let identified = new Set();
while(toProcess.length > 0) {
    let allergen = toProcess.shift();

    // intersect to find the list of potentials for this allergen
    let potentials = allergenRecipes.get(allergen)
        .map((id) => recipes.get(id))
        .map((recipe) => new Set(recipe.ingredients))
        .reduce((potentials, ingredients) => potentials ? sets.intersect(potentials, ingredients) : ingredients, null);

    // exclude any ingredients we already found allergens for
    potentials = sets.difference(potentials, identified);

    // if we only contain one item then we found the ingredient
    if(potentials.size == 1) {
        let id = potentials.values().next().value;
        let ingredient = ingredientDetails.get(id);
        ingredient.allergen = allergen;
        identified.add(id);
    } else {
        // otherwise we didn't figure this one out, try again after gathering more info
        toProcess.push(allergen);
    }
}

let allergenFreeUsage = 0;
let allergenIngredients = [];

ingredientDetails.forEach((ingredient, id) => {
    if(ingredient.allergen) {
        allergenIngredients.push({
            name: id,
            allergen: ingredient.allergen
        });
    } else {
        allergenFreeUsage += ingredient.recipes.length;
    }
});

let dangerousList = allergenIngredients.sort((a, b) => a.allergen.localeCompare(b.allergen))
    .map((ingredient) => ingredient.name)
    .join(',');

console.log(`Part 1 - Usage count of ingredients without known allergens: ${allergenFreeUsage}`);
console.log(`Part 2 - Canonical Dangerous Ingredient List: ${dangerousList}`);
