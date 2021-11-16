import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as fromApp from '../store/app.reducer';
import * as authActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = null;

  private storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.storeSub = this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    console.log(form.value);
    if(!form.valid) {
      return
    }

    const email = form.value.email;
    const password = form.value.password;

    if(this.isLoginMode) {
      this.store.dispatch(new authActions.LoginStart({
        email,
        password
      }));
      //authObs = this.authService.login(email, password);
    } else {
      //authObs = this.authService.signup(email, password);
      this.store.dispatch(new authActions.SignUpStart({
        email,
        password
      }));
    }

    form.reset();
  }

  onHandleError() {
    this.store.dispatch(new authActions.ClearError())
  }

  ngOnDestroy(): void {
    if(this.storeSub) this.storeSub.unsubscribe()
  }

}
