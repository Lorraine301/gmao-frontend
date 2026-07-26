import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {

  private readonly LANG_KEY = 'gmao_lang';

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem(this.LANG_KEY) ?? 'fr';
    this.translate.addLangs(['fr', 'en']);
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  getCurrentLanguage(): string {
  return this.translate.currentLang() || 'fr';
  }

  toggleLanguage(): void {
    const next = this.getCurrentLanguage() === 'fr' ? 'en' : 'fr';
    this.setLanguage(next);
  }
}