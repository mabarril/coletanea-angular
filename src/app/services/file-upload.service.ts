import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private readonly STORAGE_KEY = 'coletanea_eventos_tsv';

    /**
     * Save TSV content to localStorage
     * @param content TSV file content as string
     */
    saveTsvContent(content: string): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, content);
            console.log('TSV content saved to localStorage');
        } catch (error) {
            console.error('Error saving TSV to localStorage:', error);
            throw new Error('Failed to save TSV content');
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
            console.error('Error reading TSV from localStorage:', error);
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
     */
    clearTsvContent(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('TSV content cleared from localStorage');
        } catch (error) {
            console.error('Error clearing TSV from localStorage:', error);
        }
    }
}
