import { Injectable, inject, isDevMode } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Service for managing file uploads and TSV content storage.
 * Handles saving, retrieving, and clearing TSV content in localStorage
 * with integrated user feedback via toast notifications.
 * 
 * @example
 * ```typescript
 * constructor(private fileUpload: FileUploadService) {}
 * 
 * uploadFile(content: string) {
 *   try {
 *     this.fileUpload.saveTsvContent(content);
 *     // Success toast will be shown automatically
 *   } catch (error) {
 *     // Error toast will be shown automatically
 *   }
 * }
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private toastService = inject(ToastService);
    private readonly STORAGE_KEY = 'coletanea_eventos_tsv';

    /**
     * Save TSV content to localStorage
     * Shows success or error toast notification
     * @param content - TSV file content as string
     * @throws Error if save operation fails
     */
    saveTsvContent(content: string): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, content);

            // Log only in development mode
            if (isDevMode()) {
                console.log('TSV content saved to localStorage');
            }

            this.toastService.success('Arquivo TSV salvo com sucesso!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (isDevMode()) {
                console.error('Error saving TSV to localStorage:', error);
            }

            this.toastService.error('Erro ao salvar arquivo TSV. Verifique o espaço disponível.');
            throw new Error(`Failed to save TSV content: ${errorMessage}`);
        }
    }

    /**
     * Get TSV content from localStorage
     * @returns TSV content or null if not found
     */
    getTsvContent(): string | null {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (error) {
            if (isDevMode()) {
                console.error('Error reading TSV from localStorage:', error);
            }

            this.toastService.error('Erro ao carregar arquivo TSV.');
            return null;
        }
    }

    /**
     * Check if uploaded TSV content exists
     * @returns true if content exists in localStorage
     */
    hasUploadedContent(): boolean {
        return this.getTsvContent() !== null;
    }

    /**
     * Clear uploaded TSV content from localStorage
     * Shows success toast notification
     */
    clearTsvContent(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);

            if (isDevMode()) {
                console.log('TSV content cleared from localStorage');
            }

            this.toastService.info('Arquivo TSV removido.');
        } catch (error) {
            if (isDevMode()) {
                console.error('Error clearing TSV from localStorage:', error);
            }

            this.toastService.error('Erro ao remover arquivo TSV.');
        }
    }
}

