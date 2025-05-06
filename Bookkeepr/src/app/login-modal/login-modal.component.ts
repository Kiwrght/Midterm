import { NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../services/users.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css'
})
export class LoginModalComponent {
  username = '';
  password = '';
  errorMsg = '';
  usersSvc = inject(UsersService);
  router = inject(Router);
  currentRoute = inject(ActivatedRoute);

  ngOnInit(): void {}

  login() {
    this.errorMsg = '';
    this.usersSvc.signIn(this.username, this.password).subscribe({
      next: (_) => {
        this.router.navigate(['..'], { relativeTo: this.currentRoute });
      },
      error: (e) => {
        this.errorMsg = e.error.detail || e.error;
      },
    });
  }
}


