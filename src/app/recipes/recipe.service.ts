import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";
//import { ShoppingListService } from "../shopping-list/shopping-list.service";
import * as ShoppingListActions from "../shopping-list/store/shopping-list.actions";
import { AppState } from "../store/app.reducer";

import { Recipe } from "./recipe.model";

@Injectable()
export class RecipeService {
    recipesChanged = new Subject<Recipe[]>();
    private recipes: Recipe[] = [];

    /* recipes = [
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
    ]; */

    constructor(private store: Store<AppState>) { }

    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes;
        this.recipesChanged.next(this.recipes.slice());
    }

    getRecipes() {
        return this.recipes.slice();
    }

    getRecipe(index: number) {
        return this.recipes[index];
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        //this.slService.addIngredients(ingredients);
        this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients));
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.recipesChanged.next(this.recipes.slice());
    }
}