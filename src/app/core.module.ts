import { NgModule } from "@angular/core";
import { AuthService } from './auth/auth.service';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { AuthGuard } from './auth/auth.guard';
import { ShoppingListService } from './shopping-list/shopping-list.service';
import { RecipeService } from './recipes/recipe.service';
import { DataStorageService } from './shared/data-storage.service';
import { RecipeResolverService } from './recipes/recipes-resolver.service';
import { HTTP_INTERCEPTORS } from "@angular/common/http";

@NgModule({
    providers: [
        ShoppingListService,
        RecipeService, 
        DataStorageService, 
        RecipeResolverService, 
        AuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        },
        AuthGuard
    ]
})
export class CoreModule {

}