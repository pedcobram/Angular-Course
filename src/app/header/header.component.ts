import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { DataStorageService } from "../shared/data-storage.service";

@Component({
    'selector': 'app-header',
    'templateUrl': 'header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
    isAuthenticated = false;
    private subscription: Subscription;

    constructor(private dsService: DataStorageService, private authService: AuthService) { }

    ngOnInit(): void {
        this.subscription = this.authService.user.subscribe(user => {
            this.isAuthenticated = !user ? false : true;
        });
    }

    onSaveData() {
        this.dsService.storeRecipes();
    }

    onFetchData() {
        this.dsService.fetchRecipes().subscribe();
    }

    onLogout() {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}