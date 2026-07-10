import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SparePartService } from '../../services/spare-part.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SparePart } from '../../models/spare-part.model';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {

  parts: SparePart[] = [];
  isLoading = false;
  errorMessage = '';
  showLowStockOnly = false;

  constructor(
    private sparePartService: SparePartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadParts(); }

  get isAdmin(): boolean { return this.authService.getRole() === 'Admin'; }

  loadParts(): void {
    this.isLoading = true;
    this.sparePartService.findAll(this.showLowStockOnly || undefined).subscribe({
      next: (data) => { this.parts = [...data]; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  toggleFilter(): void { this.showLowStockOnly = !this.showLowStockOnly; this.loadParts(); }

  get lowStockCount(): number { return this.parts.filter(p => p.lowStock).length; }
}