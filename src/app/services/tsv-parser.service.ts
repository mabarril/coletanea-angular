import { Injectable } from '@angular/core';
import { Evento } from './colendario.service';

interface BookingRow {
    dateTime: string;
    customerName: string;
    customerEmail: string;
    service: string;
    location: string;
    duration: number;
    customFields: string;
}

@Injectable({
    providedIn: 'root'
})
export class TsvParserService {

    /**
     * Parse TSV content from Microsoft Bookings export
     * @param tsvContent The raw TSV file content as string
     * @returns Array of Evento objects
     * 
     * 
     */

    parseTsvToEventos(tsvContent: string): Evento[] {
        const lines = tsvContent.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            console.warn('TSV file is empty or has no data rows');
            return [];
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const eventos: Evento[] = [];
        let eventNumber = 1;

        for (const line of dataLines) {
            try {
                const evento = this.parseRow(line, eventNumber);
                if (evento) {
                    eventos.push(evento);
                    eventNumber++;
                }
            } catch (error) {
                console.error('Error parsing TSV row:', error, line);
            }
        }
        console.log(eventos);
        return eventos;
    }

    private parseRow(line: string, eventNumber: number): Evento | null {
        const columns = line.split('\t');

        if (columns.length < 18) {
            console.warn('Invalid row: not enough columns', line);
            return null;
        }

        const dateTimeStr = columns[0]?.trim();
        if (!dateTimeStr) {
            return null; // Skip empty rows
        }

        // Parse date/time (format: DD/MM/YYYY HH:MM)
        const dataInicio = this.parseDateTime(dateTimeStr);
        if (!dataInicio) {
            console.warn('Could not parse date/time:', dateTimeStr);
            return null;
        }

        // Extract duration and calculate end time
        const durationMinutes = parseInt(columns[10]) || 60;
        const dataFim = new Date(dataInicio);
        dataFim.setMinutes(dataFim.getMinutes() + durationMinutes);

        // Extract service name (column 8)
        const serviceName = columns[8]?.trim() || 'Evento sem título';

        // Parse custom fields (column 17) - it's a JSON string
        const customFieldsStr = columns[17]?.trim();
        let nomeEvento = serviceName;
        let quantidadeParticipantes = 50; // default

        if (customFieldsStr) {
            try {
                const customFields = JSON.parse(customFieldsStr);
                nomeEvento = customFields['Nome do evento'] || serviceName;
                const qtdStr = customFields['Quantidade estimada de participantes'];
                if (qtdStr) {
                    quantidadeParticipantes = parseInt(qtdStr) || 50;
                }
            } catch (e) {
                console.warn('Could not parse custom fields:', customFieldsStr);
            }
        }

        // Extract location (column 9)
        const location = columns[8]?.trim() || '';

        // Extract space/venue from location (text before '-')
        let espaco = '';
        if (location) {
            const dashIndex = location.indexOf('-');
            if (dashIndex !== -1) {
                espaco = location.substring(0, dashIndex).trim();
            } else {
                espaco = location;
            }
        }

        // Determine modalidade based on location or service name
        // If location is empty or contains "online", it's online (2), otherwise presencial (1)
        const codigoTipoModalidadeEvento =
            location.toLowerCase().includes('online') || !location ? 2 : 1;

        return {
            numeroEvento: eventNumber,
            nomeEvento: nomeEvento,
            dataInicioEvento: dataInicio,
            dataFimEvento: dataFim,
            codigoTipoEstadoEvento: 1, // Active
            codigoTipoEvento: 1, // Default event type
            codigoUnidadeOrganizacionalEvento: 100,
            codigoTipoModalidadeEvento: codigoTipoModalidadeEvento,
            quantidadeMaximaParticipantesEvento: quantidadeParticipantes,
            criadorId: columns[1]?.trim() || 'unknown', // Customer name as creator
            isDiaTodoEvento: dataInicio.getHours() < 8 || dataInicio.getHours() >= 19,
            localEvento: location,
            espaco: espaco
        };
    }

    /**
     * Parse date/time string in format DD/MM/YYYY HH:MM
     * @param dateTimeStr Date time string
     * @returns Date object or null if parsing fails
     */
    private parseDateTime(dateTimeStr: string): Date | null {
        try {
            // Format: DD/MM/YYYY HH:MM
            const parts = dateTimeStr.split(' ');
            if (parts.length !== 2) {
                return null;
            }

            const dateParts = parts[0].split('/');
            const timeParts = parts[1].split(':');

            if (dateParts.length !== 3 || timeParts.length !== 2) {
                return null;
            }

            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const year = parseInt(dateParts[2]);
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);

            const date = new Date(year, month, day, hour, minute);

            // Validate the date
            if (isNaN(date.getTime())) {
                return null;
            }

            return date;
        } catch (error) {
            console.error('Error parsing date/time:', error);
            return null;
        }
    }
}
