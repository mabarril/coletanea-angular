import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-angular';
import { ToastService } from '../../services/toast.service';

/**
 * Toast notification component that displays toast messages from the ToastService.
 * Supports multiple toast types (success, error, warning, info) with appropriate
 * styling and icons. Includes accessibility features (ARIA labels, live regions)
 * and smooth animations.
 * 
 * This component should be included once in the root app component to display
 * toasts globally across the application.
 */
@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.css'
})
export class ToastComponent {
    private toastService = inject(ToastService);

    /**
     * Access to the toasts signal from the service
     */
    readonly toasts = this.toastService.toasts;

    /**
     * Icon references for each toast type
     */
    readonly icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info
    };

    /**
     * Close icon
     */
    readonly X = X;

    /**
     * Remove a toast by ID
     * @param id - The ID of the toast to remove
     */
    removeToast(id: string): void {
        this.toastService.remove(id);
    }

    /**
     * Get the appropriate icon for a toast type
     * @param type - The toast type
     * @returns The icon component
     */
    getIcon(type: 'success' | 'error' | 'warning' | 'info') {
        return this.icons[type];
    }
}
