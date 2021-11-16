import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../../recipes/store/recipe.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe: Recipe;
  id: number;
  params: Subscription;

  constructor(private recipeService: RecipeService, private route: ActivatedRoute, private router: Router, private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.params = this.route.params.subscribe(
      (params) => {
        this.id = +params['id'];
        //this.recipe = this.recipeService.getRecipe(this.id);
        this.store.select('recipes')
        .pipe(map(
          recipesState => {
            return recipesState.recipes.find((recipe, index) => {
              return index === this.id
            });
          })
        ).subscribe(recipe => {
          this.recipe = recipe
        });
      });
  }

  ngOnDestroy(): void {
    this.params.unsubscribe();
  }

  onAddToShoppingList() {
    this.store.dispatch(new ShoppingListActions.AddIngredients(this.recipe.ingredients));
    //this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  onEditRecipe() {
    this.router.navigate(['edit'], { relativeTo: this.route });
    /* this.router.navigate(['../', this.id, 'edit'], { relativeTo: this.route }); */
  }

  onDeleteRecipe() {
    this.store.dispatch(new RecipesActions.DeleteRecipe(this.id));
    //this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['recipes']);
  }

}
