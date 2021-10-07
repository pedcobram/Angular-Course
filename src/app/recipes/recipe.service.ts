import { Injectable } from "@angular/core";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Recipe } from "./recipe.model";

@Injectable()
export class RecipeService {

    private recipes: Recipe[] = [
        new Recipe('Ribs with greens on the side', 
        'This is a test description for a recipe 1', 
        'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg', 
        [
            new Ingredient('Ribs', 1),
            new Ingredient('Tomatoes', 2),
            new Ingredient('Green Peppers', 2)
        ]),
        new Recipe('Hamburguer and fries', 
        'This is a test description for a recipe 2', 
        'https://barradeideas.com/wp-content/uploads/2019/09/fast-food.jpg',
        [
            new Ingredient('Meat', 1),
            new Ingredient('Buns', 2),
            new Ingredient('Fries', 20)
        ])
    ];

    constructor(private slService: ShoppingListService) { }

    getRecipes() {
        return this.recipes.slice();
    }

    getRecipe(index: number) {
        return this.recipes[index];
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients);
    }
}