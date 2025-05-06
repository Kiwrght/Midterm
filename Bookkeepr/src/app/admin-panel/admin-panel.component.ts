import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];
  books: any[] = []; //  Stores fetched books
  isAdmin = false;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  promoteUser(username: string): void {
    this.usersService.promoteUser(username).subscribe(() => {
      this.users = this.users.map(user =>
        user.username === username ? { ...user, role: 'admin' } : user
      );
    });
  }

  demoteUser(username: string): void {
    this.usersService.demoteUser(username).subscribe(() => {
      this.users = this.users.map(user =>
        user.username === username ? { ...user, role: 'user' } : user
      );
    });
  }

  deleteUser(username: string): void {
    this.usersService.deleteUser(username).subscribe(() => {
      this.users = this.users.filter(user => user.username !== username);
    });
  }

  displayBooks(): void {
    console.log("Fetching books...");
    //  Add API logic here to retrieve books
  }

  displayUsers(): void {
    this.usersService.getUsers().subscribe(users => {
      this.users = users; // ✅ Updates user list reactively
    });
  }
  
}