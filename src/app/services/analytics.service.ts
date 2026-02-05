import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Google Analytics gtag function interface
 */
interface GtagFunction {
  (command: 'config', targetId: string, config?: GtagConfigParams): void;
  (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
  (command: 'set', config: GtagSetParams): void;
}

/**
 * Google Analytics config parameters
 */
interface GtagConfigParams {
  page_path?: string;
  page_title?: string;
  page_location?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Google Analytics event parameters
 */
interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Google Analytics set parameters
 */
interface GtagSetParams {
  [key: string]: string | number | boolean;
}

/**
 * Declare gtag as a global function with proper typing
 */
declare const gtag: GtagFunction;

/**
 * Google Analytics 4 tracking ID
 */
const GA4_MEASUREMENT_ID = 'G-PKT41R26W2';

/**
 * Service for tracking analytics events using Google Analytics 4.
 * Provides methods for tracking page views and custom events with
 * proper type safety and browser environment checks.
 * 
 * @example
 * ```typescript
 * constructor(private analytics: AnalyticsService) {}
 * 
 * trackUserAction() {
 *   this.analytics.trackEvent('button_click', {
 *     event_category: 'engagement',
 *     event_label: 'export_image'
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Track page views in Google Analytics
   * @param url - The page URL to track
   * @param title - Optional page title
   */
  trackPageView(url: string, title?: string): void {
    if (this.isBrowser && typeof gtag !== 'undefined') {
      const config: GtagConfigParams = {
        page_path: url
      };

      if (title) {
        config.page_title = title;
      }

      gtag('config', GA4_MEASUREMENT_ID, config);
    }
  }

  /**
   * Track custom events in Google Analytics
   * @param eventName - The name of the event to track
   * @param eventParams - Optional event parameters
   * 
   * @example
   * ```typescript
   * this.analytics.trackEvent('export_image', {
   *   event_category: 'user_action',
   *   event_label: 'screen_generator',
   *   value: 1
   * });
   * ```
   */
  trackEvent(eventName: string, eventParams: GtagEventParams = {}): void {
    if (this.isBrowser && typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  }
}

