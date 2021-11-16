import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecipeService } from '../recipe.service';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../../recipes/store/recipe.actions';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  params: Subscription;
  id: number;
  editMode = false;
  recipeForm: FormGroup;

  private storeSub: Subscription;

  get controls() { // a getter!
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router, private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.params = this.route.params.subscribe(
      (params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
        this.initForm();
      }
    );
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);

    if(this.editMode) {
      //const recipe = this.recipeService.getRecipe(this.id);
      this.storeSub = this.store.select('recipes')
      .pipe(
        map(
          recipeState => {
            return recipeState.recipes.find((recipe, index) => {
              return index === this.id;
            });
          })
      ).subscribe(recipe => {
        recipeName = <string> recipe.name;
        recipeImagePath = <string> recipe.imagePath;
        recipeDescription = <string> recipe.description;
        if(recipe['ingredients']) {
          for (let ingredient of recipe.ingredients) {
            recipeIngredients.push(new FormGroup({
              'name': new FormControl(ingredient.name, Validators.required),
              'amount': new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
            }));
          }
        }
      });
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }

  onSubmit() {
    /* const newRecipe = new Recipe(
      this.recipeForm.value['name'],
      this.recipeForm.value['description'],
      this.recipeForm.value['imagePath'],
      this.recipeForm.value['ingredients']
    ); */
    //console.log(this.recipeForm.value)

    if(this.editMode) {
      this.store.dispatch(new RecipesActions.UpdateRecipe({id: this.id, newRecipe: this.recipeForm.value}));
      //this.recipeService.updateRecipe(this.id, this.recipeForm.value);
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
      //this.recipeService.addRecipe(this.recipeForm.value);
    }
    this.onCancel();
  }

  onAddIngredient() {
    (<FormArray> this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
      })
    );
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  ngOnDestroy(): void {
    this.params.unsubscribe();
    if(this.storeSub) this.storeSub.unsubscribe();
  }
  
}
