import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  filterRole = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.findAll(this.filterRole || undefined).subscribe({
      next: (data) => { this.users = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  toggleActive(user: User): void {
    const action = user.active
      ? this.userService.deactivate(user.id)
      : this.userService.reactivate(user.id);

    action.subscribe({
      next: () => {
        this.successMessage = user.active ? 'Utilisateur désactivé.' : 'Utilisateur réactivé.';
        this.loadUsers();
      },
      error: () => { this.errorMessage = 'Erreur lors de la mise à jour.'; this.cdr.detectChanges(); }
    });
  }

  getRoleLabel(r: string): string {
    return { Admin: 'Admin', Supervisor: 'Superviseur', Technician: 'Technicien' }[r] ?? r;
  }
}