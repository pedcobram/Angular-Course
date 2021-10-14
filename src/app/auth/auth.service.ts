import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
    email: string;
    expiresIn: string;
    idToken: string;
    kind: string;
    localId: string;
    refreshToken: string;
    registered?: boolean;
}

@Injectable()
export class AuthService {
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router) {  }

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBSEMjJ92bswnVFXSrDUJlF68LgJy0G_gE',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(
            catchError( errorRes => {
                return this.handleError(errorRes);
            }),
            tap(resData => {
                return this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
            })
        );
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBSEMjJ92bswnVFXSrDUJlF68LgJy0G_gE',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(
            catchError(errorRes => {
                return this.handleError(errorRes);
            }),
            tap(resData => {
                return this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
            })
        );
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogin() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if(!userData) {
            return;
        }

        const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout()
        }, expirationDuration);
    }

    private handleAuth(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let error = 'An unknown error occurred!';
        if(!errorRes.error || !errorRes.error.error) {
            return throwError(error);
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
        return throwError(error);
    }

}