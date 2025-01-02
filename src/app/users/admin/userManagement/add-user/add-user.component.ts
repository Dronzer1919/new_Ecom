import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserManagementService } from '../user-management.service';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, NgxDatatableModule,ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  users: any[] = [];
  userForm: FormGroup;
  selectedUser: any = null; // To track the user being edited
  userToDelete: any = null; // For the user to be deleted
  roles: string[] = ['admin', 'user', 'superadmin']; // Role options for the dropdown

  constructor(private fb: FormBuilder, private userService: UserManagementService) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  // Get all users
  getUsers(): void {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
    });
  }

  // Open the Add User Modal
  openAddUserModal(): void {
    this.selectedUser = null;
    this.userForm.reset();
  }

  // Open the Edit User Modal and populate the form
  editUser(user: any): void {
    this.selectedUser = user;
    this.userForm.patchValue({
      email: user.email,
      role: user.role,
      password: '' // We leave the password empty, as it is not always needed during edit
    });
  }

  // Save user changes (Add or Update)
  saveUser(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value; // Get the form values
      if (this.selectedUser) {
        // Update existing user
        this.userService.updateUser(this.selectedUser._id, userData).subscribe(() => {
          this.getUsers();
          this.closeModal();
        });
      } else {
        // Add new user
        this.userService.addNewUser(userData).subscribe(() => {
          this.getUsers();
          this.closeModal();
        });
      }
    }
  }

  // Open delete confirmation modal
  deleteUser(userId: string): void {
    this.userToDelete = userId;
  }

  // Confirm deletion
  confirmDeleteUser(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete).subscribe(() => {
        this.getUsers();  // Refresh the user list after deletion
        this.closeDeleteModal(); // Close the delete confirmation modal
      });
    }
  }

  // Close the edit/add user modal
  closeModal(): void {
    this.selectedUser = null;
    this.userForm.reset();
  }

  // Close the delete confirmation modal
  closeDeleteModal(): void {
    this.userToDelete = null;
  }
}
