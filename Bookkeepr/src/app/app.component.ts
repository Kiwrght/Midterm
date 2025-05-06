import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UsersService } from './services/users.service';

interface InternalRoute {
  path: string;
  text: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgbDropdownModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  username = '';
  isAdmin = false;
  usersSvc = inject(UsersService);
  routes: InternalRoute[] = [];
  private userSubscription?: Subscription;

  ngOnInit(): void {
    this.userSubscription = this.usersSvc.user$.subscribe((user) => {
      this.username = user?.username || '';
      this.isAdmin = user?.role === 'AdminUser';
      this.routes = [];

      if (user?.role) {
        this.routes.push({ path: 'books', text: 'My Books' });
        this.routes.push({ path: 'add-book', text: 'Add Book' });
      }

      if (this.isAdmin) {
        this.routes.push({ path: 'admin', text: 'Admin Panel' });
      }
    });
  }

  logout() {
    this.username = '';
    this.isAdmin = false;
    this.usersSvc.logout();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}