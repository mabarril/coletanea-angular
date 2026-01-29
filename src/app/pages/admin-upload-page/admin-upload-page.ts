import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Upload, CheckCircle, XCircle, FileText, ArrowLeft, Trash2 } from 'lucide-angular';
import { FileUploadService } from '../../services/file-upload.service';
import { TsvParserService } from '../../services/tsv-parser.service';
import { ColendarioService, Evento } from '../../services/colendario.service';

@Component({
    selector: 'app-admin-upload-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './admin-upload-page.html',
    styleUrl: './admin-upload-page.css'
})
export class AdminUploadPageComponent {
    private fileUploadService = inject(FileUploadService);
    private tsvParser = inject(TsvParserService);
    private colendarioService = inject(ColendarioService);
    private router = inject(Router);

    readonly Upload = Upload;
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly FileText = FileText;
    readonly ArrowLeft = ArrowLeft;
    readonly Trash2 = Trash2;

    isDragging = signal(false);
    uploadStatus = signal<'idle' | 'success' | 'error'>('idle');
    errorMessage = signal<string>('');
    uploadedFileName = signal<string>('');
    previewEvents = signal<Evento[]>([]);
    hasUploadedContent = signal(false);

    constructor() {
        this.checkUploadedContent();
    }

    checkUploadedContent(): void {
        this.hasUploadedContent.set(this.fileUploadService.hasUploadedContent());
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(false);
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(false);

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
        }
    }

    private handleFile(file: File): void {
        // Validate file type
        if (!file.name.endsWith('.tsv') && !file.name.endsWith('.txt')) {
            this.uploadStatus.set('error');
            this.errorMessage.set('Arquivo inválido. Por favor, selecione um arquivo .tsv ou .txt');
            return;
        }

        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            this.processFile(content, file.name);
        };
        reader.onerror = () => {
            this.uploadStatus.set('error');
            this.errorMessage.set('Erro ao ler o arquivo');
        };
        reader.readAsText(file);
    }

    private processFile(content: string, fileName: string): void {
        try {
            // Parse TSV to validate
            const eventos = this.tsvParser.parseTsvToEventos(content);

            if (eventos.length === 0) {
                this.uploadStatus.set('error');
                this.errorMessage.set('Nenhum evento válido encontrado no arquivo');
                return;
            }

            // Save to localStorage
            this.fileUploadService.saveTsvContent(content);

            // Update preview
            this.previewEvents.set(eventos.slice(0, 5)); // Show first 5 events
            this.uploadedFileName.set(fileName);
            this.uploadStatus.set('success');
            this.hasUploadedContent.set(true);

            // Refresh calendar service
            this.colendarioService.refreshEventos();
        } catch (error) {
            this.uploadStatus.set('error');
            this.errorMessage.set('Erro ao processar o arquivo: ' + (error as Error).message);
        }
    }

    clearUpload(): void {
        this.fileUploadService.clearTsvContent();
        this.uploadStatus.set('idle');
        this.previewEvents.set([]);
        this.uploadedFileName.set('');
        this.hasUploadedContent.set(false);
        this.colendarioService.refreshEventos();
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    formatTime(date: Date): string {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}
