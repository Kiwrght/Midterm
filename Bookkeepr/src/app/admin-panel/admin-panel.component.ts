
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Ensure you have an auth service
import { UsersService } from '../services/users.service'; // Ensure you have a user service
import { BookService } from '../services/book.service'; // Ensure you have a book service
import { Router } from '@angular/router'; // For navigation


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  isAdmin = false; // Tracks admin status

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'admin'; // Check admin role
  }
}

function displayBooks(this: any) {

  console.log("Fetching books...");
  // Call your BookService here to get all books
  this.bookService.getBooks().subscribe((books: any) => {
    this.books = books;
  });
}
  
function promoteUser(this: any, user: any) {
  console.log(`Promoting ${user.username} to admin...`);
  // Call your API to update user role here
  this.userService.promoteUser(user.id).subscribe(() => {
    user.role = 'admin'; //Update role locally after successful API call
  });
}
function constructor(private: any, userService: any, UserService: any) {
  throw new Error('Function not implemented.');
}

