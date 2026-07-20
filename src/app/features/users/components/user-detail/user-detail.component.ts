import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  user?: User;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.findById(+id).subscribe({
        next: (u) => { this.user = u; this.isLoading = false; this.cdr.detectChanges(); },
        error: () => { this.errorMessage = 'Utilisateur introuvable.'; this.isLoading = false; this.cdr.detectChanges(); }
      });
    }
  }

  getRoleLabel(r: string): string {
    return { Admin: 'Admin', Supervisor: 'Superviseur', Technician: 'Technicien' }[r] ?? r;
  }
}