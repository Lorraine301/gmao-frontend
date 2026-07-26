import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Si déjà connecté, redirige directement vers le dashboard/interventions
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role === 'Technician') {
        this.router.navigate(['/my-interventions']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  get currentLang(): string {
    return this.languageService.getCurrentLanguage();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
}