import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Equipment } from '../../models/equipment.model';
import { downloadBlob } from '../../../../core/utils/download.util';
import * as QRCode from 'qrcode';

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
  isDownloadingDatasheet = false;
  qrCodeDataUrl: string | null = null;

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
          this.generateQrCode(eq.id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Équipement introuvable.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private generateQrCode(equipmentId: number): void {
    const url = `${window.location.origin}/equipments/${equipmentId}`;
    QRCode.toDataURL(url, { width: 200, margin: 1 })
      .then((dataUrl) => {
        this.qrCodeDataUrl = dataUrl;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.qrCodeDataUrl = null;
      });
  }

  downloadQrCode(): void {
    if (!this.qrCodeDataUrl || !this.equipment) return;
    const a = document.createElement('a');
    a.href = this.qrCodeDataUrl;
    a.download = `qrcode_${this.equipment.code}.png`;
    a.click();
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
  downloadDatasheet(): void {
    if (!this.equipment) return;
    this.isDownloadingDatasheet = true;

    this.equipmentService.downloadDatasheet(this.equipment.id).subscribe({
      next: (blob) => {
        downloadBlob(blob, `fiche_${this.equipment!.code}.pdf`);
        this.isDownloadingDatasheet = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDownloadingDatasheet = false;
        this.errorMessage = 'Erreur lors du téléchargement de la fiche.';
        this.cdr.detectChanges();
      }
    });
   }
}