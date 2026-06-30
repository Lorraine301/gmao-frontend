import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Equipment } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipment-detail.component.html',
  styleUrl: './equipment-detail.component.scss'
})
export class EquipmentDetailComponent implements OnInit {

  equipment?: Equipment;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private equipmentService: EquipmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef  // ← AJOUTER
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.equipmentService.findById(+id).subscribe({
        next: (eq) => {
          this.equipment = eq;
          this.isLoading = false;
          this.cdr.detectChanges(); // ← forcer le rendu
        },
        error: () => {
          this.errorMessage = 'Équipement introuvable.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'Admin';
  }

  getStatusLabel(status: string): string {
    const l: Record<string, string> = {
      'Active': 'Actif', 'Inactive': 'Inactif', 'Under_Maintenance': 'En maintenance'
    };
    return l[status] ?? status;
  }

  getCriticalityLabel(level: string): string {
    const l: Record<string, string> = {
      'Low': 'Faible', 'Medium': 'Moyen', 'High': 'Élevé'
    };
    return l[level] ?? level;
  }
}