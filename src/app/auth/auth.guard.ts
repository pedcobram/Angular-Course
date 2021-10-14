import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, router: RouterStateSnapshot) {

        return this.authService.user.pipe(
            take(1),
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