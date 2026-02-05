import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from './services/analytics.service';
import { BackgroundCollabsComponent } from './components/background-collabs/background-collabs.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, LucideAngularModule, BackgroundCollabsComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  notLanding = false;
  readonly ArrowLeft = ArrowLeft;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.notLanding = event.urlAfterRedirects !== '/';
        this.analytics.trackPageView(event.urlAfterRedirects);
      }
    });
  }
}
