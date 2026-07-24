import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../services/equipment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Equipment, EquipmentFilters, EquipmentStatus, CriticalityLevel, EquipmentImportResult } from '../../models/equipment.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { downloadBlob } from '../../../../core/utils/download.util';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './equipment-list.component.html',
  styleUrl: './equipment-list.component.scss'
})
export class EquipmentListComponent implements OnInit, OnDestroy {

  equipments: Equipment[] = [];
  isLoading = false;
  errorMessage = '';
  deleteConfirmId: number | null = null;
  updatingStatusId: number | null = null;
  
  searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();


  filters: EquipmentFilters = {
    status: undefined,
    type: undefined,
    criticality: undefined
  };

  statusOptions: EquipmentStatus[] = ['Active', 'Inactive', 'Under_Maintenance'];
  criticalityOptions: CriticalityLevel[] = ['Low', 'Medium', 'High'];

  // ── Export ──────────────────────────────────────────────
  showExportMenu = false;
  isExporting = false;

  // ── Import ──────────────────────────────────────────────
  showImportModal = false;
  isDraggingFile = false;
  selectedFile: File | null = null;
  isImporting = false;
  importResult: EquipmentImportResult | null = null;
  importError = '';

  constructor(
    private equipmentService: EquipmentService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← AJOUTER
  ) {}

  ngOnInit(): void {
    // Debounce sur la recherche (attend 400ms après la dernière frappe)
    this.searchInput$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadEquipments();
      });

    this.loadEquipments();
  }

  ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.filters.search = value || undefined;
    this.searchInput$.next(value);
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'Admin';
  }

  loadEquipments(): void {
    this.isLoading = true;
    this.errorMessage = '';
  

    // Nettoyer les filtres vides avant d'envoyer
    const activeFilters: EquipmentFilters = {};
    if (this.filters.status)      activeFilters.status = this.filters.status;
    if (this.filters.type)        activeFilters.type = this.filters.type;
    if (this.filters.criticality) activeFilters.criticality = this.filters.criticality;
    if (this.filters.search)      activeFilters.search = this.filters.search;

    this.equipmentService.findAll(activeFilters).subscribe({
      next: (data) => {
        this.equipments = [...data]; // ← spread pour forcer la référence
        this.isLoading = false;
        this.cdr.detectChanges(); // ← forcer le rendu
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 0
          ? 'Impossible de contacter le serveur.'
          : this.getErrorMessage(err);
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(): void {
    this.loadEquipments();
  }

  resetFilters(): void {
    this.filters = { status: undefined, type: undefined, criticality: undefined };
    this.loadEquipments();
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
    this.cdr.detectChanges();
  }

  deleteEquipment(id: number): void {
    this.equipmentService.delete(id).subscribe({
      next: () => {
        this.equipments = this.equipments.filter(e => e.id !== id);
        this.deleteConfirmId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err);
        this.deleteConfirmId = null;
        this.cdr.detectChanges();
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Export
  // ══════════════════════════════════════════════════════════

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  exportEquipments(format: 'excel' | 'json'): void {
    this.showExportMenu = false;
    this.isExporting = true;
    this.equipmentService.exportEquipments(format).subscribe({
      next: (blob) => {
        const filename = format === 'excel' ? 'equipements.xlsx' : 'equipements.json';
        downloadBlob(blob, filename);
        this.isExporting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExporting = false;
        this.errorMessage = 'Erreur lors de l\'export.';
        this.cdr.detectChanges();
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Import
  // ══════════════════════════════════════════════════════════

  openImportModal(): void {
    this.showImportModal = true;
    this.selectedFile = null;
    this.importResult = null;
    this.importError = '';
    this.cdr.detectChanges();
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.cdr.detectChanges();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validExtensions = ['.xlsx', '.json'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      this.importError = 'Format non supporté. Utilisez un fichier .xlsx ou .json';
      this.selectedFile = null;
      this.cdr.detectChanges();
      return;
    }

    this.selectedFile = file;
    this.importError = '';
    this.importResult = null;
    this.cdr.detectChanges();
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.cdr.detectChanges();
  }

  confirmImport(): void {
    if (!this.selectedFile) return;
    this.isImporting = true;
    this.importError = '';

    this.equipmentService.importEquipments(this.selectedFile).subscribe({
      next: (result) => {
        this.importResult = result;
        this.isImporting = false;
        this.selectedFile = null;
        this.loadEquipments(); // rafraîchit la liste avec les nouveaux équipements
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isImporting = false;
        this.importError = err.error?.error ?? 'Erreur lors de l\'import.';
        this.cdr.detectChanges();
      }
    });
  }
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Active': 'Actif', 'Inactive': 'Inactif', 'Under_Maintenance': 'En maintenance'
    };
    return labels[status] ?? status;
  }

  getCriticalityLabel(level: string): string {
    const labels: Record<string, string> = {
      'Low': 'Faible', 'Medium': 'Moyen', 'High': 'Élevé'
    };
    return labels[level] ?? level;
  }

  private getErrorMessage(err: any): string {
    if (err.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (err.status === 403) return 'Accès non autorisé.';
    if (err.status === 404) return 'Équipement introuvable.';
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
  duplicateEquipment(eq: Equipment): void {
  this.router.navigate(['/equipments/new'], { state: { duplicateFrom: eq } });
  }
  onStatusChange(eq: Equipment, newStatus: EquipmentStatus): void {
    if (newStatus === eq.status) return;

    const previousStatus = eq.status;
    this.updatingStatusId = eq.id;

    this.equipmentService.updateStatus(eq.id, newStatus).subscribe({
      next: (updated) => {
        eq.status = updated.status;
        this.updatingStatusId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        eq.status = previousStatus; // rollback visuel en cas d'échec
        this.updatingStatusId = null;
        this.errorMessage = 'Erreur lors du changement de statut.';
        this.cdr.detectChanges();
      }
    });
  }
}