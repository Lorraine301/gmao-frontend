import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../../core/services/profile.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  profile?: UserProfile;
  isLoading = true;
  errorMessage = '';

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.profileService.getMyProfile().subscribe({
      next: (p) => { this.profile = p; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Erreur de chargement du profil.'; this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  getRoleLabel(r: string): string {
    return { Admin: 'Admin', Supervisor: 'Superviseur', Technician: 'Technicien' }[r] ?? r;
  }
}