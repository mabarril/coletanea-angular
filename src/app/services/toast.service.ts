import { Injectable, signal, inject } from '@angular/core';
import { Toast, ToastType } from '../types';
import { AnalyticsService } from './analytics.service';

/**
 * Configuration constants for toast notifications
 */
const TOAST_CONFIG = {
    DEFAULT_DURATION: 5000, // 5 seconds
    ERROR_DURATION: 8000,   // 8 seconds for errors
    MAX_TOASTS: 5,          // Maximum number of toasts to display at once
} as const;

/**
 * Service for managing toast notifications throughout the application.
 * Provides centralized toast management with auto-dismiss, type-specific styling,
 * and analytics integration for error tracking.
 * 
 * @example
 * ```typescript
 * constructor(private toastService: ToastService) {}
 * 
 * onSuccess() {
 *   this.toastService.success('Operation completed successfully!');
 * }
 * 
 * onError() {
 *   this.toastService.error('An error occurred. Please try again.');
 * }
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private analytics = inject(AnalyticsService);

    /**
     * Signal containing the current list of active toasts
     */
    readonly toasts = signal<Toast[]>([]);

    /**
     * Map to track auto-dismiss timeouts for each toast
     */
    private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

    /**
     * Show a success toast notification
     * @param message - The message to display
     * @param duration - Optional custom duration in milliseconds
     */
    success(message: string, duration?: number): void {
        this.show('success', message, duration);
    }

    /**
     * Show an error toast notification
     * Automatically tracks the error in analytics
     * @param message - The error message to display
     * @param duration - Optional custom duration in milliseconds (defaults to 8s for errors)
     */
    error(message: string, duration?: number): void {
        this.show('error', message, duration ?? TOAST_CONFIG.ERROR_DURATION);

        // Track errors in analytics
        this.analytics.trackEvent('toast_error', {
            error_message: message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Show a warning toast notification
     * @param message - The warning message to display
     * @param duration - Optional custom duration in milliseconds
     */
    warning(message: string, duration?: number): void {
        this.show('warning', message, duration);
    }

    /**
     * Show an info toast notification
     * @param message - The info message to display
     * @param duration - Optional custom duration in milliseconds
     */
    info(message: string, duration?: number): void {
        this.show('info', message, duration);
    }

    /**
     * Show a toast notification with the specified type
     * @param type - The type of toast (success, error, warning, info)
     * @param message - The message to display
     * @param duration - Optional custom duration in milliseconds
     */
    private show(type: ToastType, message: string, duration?: number): void {
        const id = this.generateId();
        const toast: Toast = {
            id,
            type,
            message,
            duration: duration ?? TOAST_CONFIG.DEFAULT_DURATION
        };

        // Get current toasts
        let currentToasts = this.toasts();

        // Limit the number of toasts displayed
        if (currentToasts.length >= TOAST_CONFIG.MAX_TOASTS) {
            // Remove the oldest toast
            const oldestToast = currentToasts[0];
            const timeoutId = this.timeouts.get(oldestToast.id);
            if (timeoutId) {
                clearTimeout(timeoutId);
                this.timeouts.delete(oldestToast.id);
            }
            // Remove from array
            currentToasts = currentToasts.slice(1);
        }

        // Add new toast
        this.toasts.set([...currentToasts, toast]);

        // Set up auto-dismiss
        if (toast.duration && toast.duration > 0) {
            const timeoutId = setTimeout(() => {
                this.remove(id);
            }, toast.duration);

            this.timeouts.set(id, timeoutId);
        }
    }

    /**
     * Remove a toast notification by ID
     * @param id - The ID of the toast to remove
     */
    remove(id: string): void {
        // Clear the timeout if it exists
        const timeoutId = this.timeouts.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeouts.delete(id);
        }

        // Remove the toast from the list
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    /**
     * Clear all toast notifications
     */
    clearAll(): void {
        // Clear all timeouts
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts.clear();

        // Clear all toasts
        this.toasts.set([]);
    }

    /**
     * Generate a unique ID for a toast
     * @returns A unique string ID
     */
    private generateId(): string {
        return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
