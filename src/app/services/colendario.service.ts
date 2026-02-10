import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TsvParserService } from './tsv-parser.service';
import { FileUploadService } from './file-upload.service';

export interface Evento {
    numeroEvento?: number;
    codigoTipoEstadoEvento: number;
    codigoTipoEvento: number;
    numeroParceriaEvento?: number;
    codigoUnidadeOrganizacionalEvento: number;
    nomeEvento: string;
    dataInicioEvento: Date;
    dataFimEvento: Date;
    textoMotivoRealizacaoEvento?: string;
    codigoTipoModalidadeEvento: number;
    quantidadeMaximaParticipantesEvento: number;
    criadorId: string;
    isDiaTodoEvento?: boolean;
    localEvento?: string;
    espaco?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ColendarioService {
    private http = inject(HttpClient);
    private tsvParser = inject(TsvParserService);
    private fileUploadService = inject(FileUploadService);

    private eventosSignal = signal<Evento[]>([]);
    readonly eventos = this.eventosSignal.asReadonly();

    readonly proximosEventos = computed(() => {
        const agora = new Date(); // Current date and time

        return this.eventosSignal()
            .filter(evento => evento.dataFimEvento >= agora) // Only events that haven't ended yet
            .sort((a, b) => a.dataInicioEvento.getTime() - b.dataInicioEvento.getTime())
            .slice(0, 10);
    });

    constructor() {
        this.carregarDadosIniciais();
    }

    refreshEventos(): void {
        this.carregarDadosIniciais();
    }

    private carregarDadosIniciais(): void {
        // Check if there's uploaded content in localStorage first
        const uploadedContent = this.fileUploadService.getTsvContent();

        if (uploadedContent) {
            console.log('Loading events from uploaded TSV (localStorage)');
            this.processarTsvContent(uploadedContent);
        } else {
            // Load TSV file from assets
            console.log('Loading events from assets/data/eventos.tsv');
            this.http.get('assets/data/eventos.tsv', { responseType: 'text' })
                .subscribe({
                    next: (tsvContent) => {
                        this.processarTsvContent(tsvContent);
                    },
                    error: (error) => {
                        console.error('Error loading TSV file:', error);
                        // Fallback to empty array on error
                        this.eventosSignal.set([]);
                    }
                });
        }
    }

    private processarTsvContent(tsvContent: string): void {
        const eventos = this.tsvParser.parseTsvToEventos(tsvContent);
        this.eventosSignal.set(eventos);
        console.log(`Loaded ${eventos.length} events from TSV file`);
    }
}
