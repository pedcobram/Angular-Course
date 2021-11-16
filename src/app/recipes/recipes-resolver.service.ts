import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DataStorageService } from "../shared/data-storage.service";
import { Recipe } from "./recipe.model";
import { RecipeService } from "./recipe.service";
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';
import { Store } from "@ngrx/store";
import { Actions, ofType } from '@ngrx/effects';
import { map, switchMap, take } from "rxjs/operators";
import { of } from "rxjs";

@Injectable()
export class RecipeResolverService implements Resolve<Recipe[]> {

    constructor(private dsService: DataStorageService, private recipeService: RecipeService, private store: Store<fromApp.AppState>, private actions$: Actions) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const recipes = this.recipeService.getRecipes();

        if(recipes.length === 0) {
            //return this.dsService.fetchRecipes();
            this.store.select('recipes')
            .pipe(
                take(1),
                map((recipesState) => {
                    return recipesState.recipes
                }
            ),
            switchMap(recipes => {
                if (recipes.length === 0) {
                    this.store.dispatch(new RecipesActions.FetchRecipes());
                    return this.actions$.pipe(
                        ofType(RecipesActions.SET_RECIPES),
                        take(1)
                    );
                } else {
                    return of(recipes);
                }
            })
            );
        } else {
            return recipes;
        }
    }
}