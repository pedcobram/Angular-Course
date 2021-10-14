import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { exhaustMap, map, take, tap } from "rxjs/operators"

import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class DataStorageService {

    constructor(private http: HttpClient, private recipesService: RecipeService, private authService: AuthService) { }

    storeRecipes() {
        const recipes = this.recipesService.getRecipes();
        this.http.put('https://ng-course-project-f3da3-default-rtdb.europe-west1.firebasedatabase.app/recipes.json', recipes)
        .subscribe(
            res => {
                console.log(res);
            }
        );
    }

    fetchRecipes() {
        return this.http.get<Recipe[]>('https://ng-course-project-f3da3-default-rtdb.europe-west1.firebasedatabase.app/recipes.json')
        .pipe(
            map(recipes => {
                return recipes.map(recipe => {
                    return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []}
                })
            }),
            tap(
                recipes => {
                    this.recipesService.setRecipes(recipes)
                }
            )
        )
    }

}