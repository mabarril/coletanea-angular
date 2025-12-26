import { Injectable, signal, computed } from '@angular/core';

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
}

@Injectable({
    providedIn: 'root'
})
export class ColendarioService {
    private eventosSignal = signal<Evento[]>([]);
    readonly eventos = this.eventosSignal.asReadonly();

    readonly proximosEventos = computed(() => {
        return this.eventosSignal()
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
        const hoje = new Date();
        const mockEventos: Evento[] = [];

        const nomes = [
            'Sessão ao Vivo: Performance em Angular', // Testing live event
            'Workshop Angular Avançado',
            'Sessão de Mentoria co.labbs',
            'Sprint Review: Projeto Phoenix',
            'Intro to Cloud Architecture',
            'UI/UX Design Trends 2026',
            'DevOps Best Practices',
            'Mobile Dev with Flutter',
            'Data Science Essentials',
            'Cybersecurity Awareness',
            'Internal Hackathon',
            'Product Management Sync'
        ];

        for (let i = 0; i < nomes.length; i++) {
            const dataInicio = new Date(hoje);

            if (i === 0) {
                // One event happening "now"
                dataInicio.setHours(hoje.getHours() - 1, 0, 0, 0);
            } else {
                dataInicio.setDate(hoje.getDate() + i);
                dataInicio.setHours(9 + (i % 8), 0, 0, 0);
            }

            const dataFim = new Date(dataInicio);
            dataFim.setHours(dataInicio.getHours() + 2);

            mockEventos.push({
                numeroEvento: i + 1,
                nomeEvento: nomes[i],
                dataInicioEvento: dataInicio,
                dataFimEvento: dataFim,
                codigoTipoEstadoEvento: 1,
                codigoTipoEvento: (i % 3) + 1,
                codigoUnidadeOrganizacionalEvento: 100 + i,
                codigoTipoModalidadeEvento: (i % 2) + 1,
                quantidadeMaximaParticipantesEvento: 50,
                criadorId: 'admin'
            });
        }

        this.eventosSignal.set(mockEventos);
    }
}
