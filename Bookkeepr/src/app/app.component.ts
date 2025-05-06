import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel/admin-panel.component.html',
  styleUrls: ['./admin-panel/admin-panel.component.css']
})
export class AdminPanelComponent {
  isAdmin = false; // ✅ Check if the user is an admin
  users: any[] = []; // ✅ Store users

  displayUsers() {
    console.log("Fetching users...");
    // API call to fetch users will go here
  }

  promoteUser(user: any) {
    console.log(`Promoting ${user.username} to admin...`);
    // API call to promote user will go here
  }

  demoteUser(user: any) {
    console.log(`Demoting ${user.username} to regular user...`);
    // API call to demote user will go here
  }
}