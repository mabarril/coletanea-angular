import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var gtag: any;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Track page views
   */
  trackPageView(url: string, title?: string) {
    if (this.isBrowser && typeof gtag !== 'undefined') {
      gtag('config', 'G-PKT41R26W2', {
        page_path: url,
        page_title: title
      });
    }
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: string, eventParams: any = {}) {
    if (this.isBrowser && typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  }
}
