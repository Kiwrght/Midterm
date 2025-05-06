import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { BookFormComponent } from './book-form/book-form.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { roleGuard } from './services/role.guard';


export const routes: Routes = [
    {
      path: '',
      component: BookListComponent,
      title: 'BookKeepr - My Books',
    },
    {
      path: 'add-book',
      component: BookFormComponent,
      title: 'BookKeepr - Add Book',
      canMatch: [roleGuard], //  Restrict access if needed
      data: {
        roles: ['BasicUser', 'AdminUser'],
      },
    },
    { path: 'edit-book/:id',
       component: BookFormComponent },
    {
      path: 'admin',
      component: AdminPanelComponent,
      title: 'BookKeepr - Admin',
      canMatch: [roleGuard], // Admin-only route
      data: {
        roles: ['AdminUser'],
      },
    },
    {
      path: 'login',
      component: LoginModalComponent,
      title: 'BookKeepr - Sign In',
    },
  ];
