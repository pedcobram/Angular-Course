import { HttpClient } from "@angular/common/http";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import * as AuthActions from './auth.actions';
import { environment } from "src/environments/environment";
import { of } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../user.model";
import { AuthService } from "../auth.service";

export interface AuthResponseData {
    email: string;
    expiresIn: string;
    idToken: string;
    kind: string;
    localId: string;
    refreshToken: string;
    registered?: boolean;
}

const handleAuthentication = (resData: any) => {
    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
    const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({
        email: resData.email,
        userId: resData.localId,
        token: resData.idToken,
        expirationDate,
        redirect: true
    });
}

const handleError = (errorRes: any) => {
    let error = 'An unknown error occurred!';
    if(!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(error));
    }

    switch (errorRes.error.error.message) {
        case  'EMAIL_EXISTS':
            error = "This email exists already!";
            break;
        case  'EMAIL_NOT_FOUND':
            error = "This email does not exist!";
            break;
        case  'INVALID_PASSWORD':
            error = "This password is not correct!";
            break;
    }
    return of(new AuthActions.AuthenticateFail(error));
}

@Injectable()
export class AuthEffects {

    @Effect()
    authSignUp = this.actions$.pipe(
        ofType(AuthActions.SIGN_UP_START),
        switchMap((signupAction: AuthActions.SignUpStart) => {
                return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
            {
                email: signupAction.payload.email,
                password: signupAction.payload.password,
                returnSecureToken: true
            }).pipe(
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                }),
                map((resData) => {
                    return handleAuthentication(resData);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                })
            )
        })
    )

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }
            ).pipe(
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                }),
                map((resData) => {
                    return handleAuthentication(resData);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                })
            )
        }),

    );

    @Effect({
        dispatch: false
    })
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS), 
        tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
            if(authSuccessAction.payload.redirect) {
                this.router.navigate(['/']);
            }
        })
    );

    @Effect({
        dispatch: false
    })
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    );

    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN),
        map(() => {
            const userData = JSON.parse(localStorage.getItem('userData'));
        
            if(!userData) {
                return;
            }

            const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

            if (loadedUser.token) {
                //this.user.next(loadedUser);
                const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);
                return new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate),
                    redirect: false
                });
            }

            return { type: 'NOAUTOLOGIN'}
        })
    );

    constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) { }


}