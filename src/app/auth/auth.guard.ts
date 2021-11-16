import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router, private store: Store<fromApp.AppState>) { }

    canActivate(route: ActivatedRouteSnapshot, router: RouterStateSnapshot) {

        return this.store.select('auth').pipe(
            take(1),
            map(authState => {
                return authState.user;
            }),
            map(
                user => {
                    const isAuth = user ? true : false; //!!user

                    if (isAuth) {
                        return true;
                    }

                    return this.router.createUrlTree(['/auth']);
                }
            )
        )
    }
}