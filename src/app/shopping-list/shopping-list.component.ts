import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { LoggingService } from '../logging.service';
import { Ingredient } from '../shared/ingredient.model';
import { AppState } from '../store/app.reducer';
//import { ShoppingListService } from './shopping-list.service';

import * as ShoppingListActions from './store/shopping-list.actions'

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ ingredients: Ingredient[] }>;
  private idChangeSubscription: Subscription;

  constructor(private loggingService: LoggingService, private store: Store<AppState>) { }

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');
    /* this.ingredients = this.slService.getIngredients();
    this.idChangeSubscription = this.slService.ingredientsChanged.subscribe(
      (ingredients: Ingredient[]) => {
        this.ingredients = ingredients;
      }
    )
    this.loggingService.printLog('Hello from Shopping List ngOnInit'); */
  }
  
  onEditItem(index: number) {
    //this.slService.startedEditing.next(index);
    this.store.dispatch(new ShoppingListActions.StartEdit(index));
  }

  ngOnDestroy(): void {
    if (this.idChangeSubscription) {
      this.idChangeSubscription.unsubscribe();
    }  
  }

}
