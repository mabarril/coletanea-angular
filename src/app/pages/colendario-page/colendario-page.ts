import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-angular';
import { ColendarioService, Evento } from '../../services/colendario.service';

@Component({
    selector: 'app-colendario-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './colendario-page.html',
    styleUrl: './colendario-page.css'
})
export class ColendarioPageComponent implements OnInit, OnDestroy {
    private colendarioService = inject(ColendarioService);

    readonly Calendar = Calendar;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly MapPin = MapPin;
    readonly Clock = Clock;
    readonly Users = Users;

    private rotationInterval: any;
    private progressInterval: any;
    private lastRefreshDate = new Date().toDateString();

    upcomingEvents = this.colendarioService.proximosEventos;
    rotationProgress = signal(0);
    readonly rotationDuration = 10000; // 10 seconds

    // Group events into pages of 5
    eventPages = computed(() => {
        const events = this.upcomingEvents();
        const pages: Evento[][] = [];
        for (let i = 0; i < events.length; i += 5) {
            pages.push(events.slice(i, i + 5));
        }
        return pages;
    });

    currentIndex = signal(0);

    ngOnInit() {
        this.startAutoRotation();
    }

    ngOnDestroy() {
        this.stopAutoRotation();
    }

    startAutoRotation() {
        this.stopAutoRotation();

        let startTime = Date.now();
        this.progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / this.rotationDuration) * 100, 100);
            this.rotationProgress.set(progress);

            if (progress >= 100) {
                this.next();
                startTime = Date.now();
                this.rotationProgress.set(0);
                this.checkDailyRefresh();
            }
        }, 100);
    }

    stopAutoRotation() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
    }

    checkDailyRefresh() {
        const today = new Date().toDateString();
        if (today !== this.lastRefreshDate) {
            this.lastRefreshDate = today;
            window.location.reload(); // Hard refresh to update data for the new day
        }
    }

    next() {
        const pages = this.eventPages();
        if (pages.length === 0) return;

        if (this.currentIndex() < pages.length - 1) {
            this.currentIndex.update(i => i + 1);
        } else {
            this.currentIndex.set(0);
        }
    }

    prev() {
        const pages = this.eventPages();
        if (pages.length === 0) return;

        if (this.currentIndex() > 0) {
            this.currentIndex.update(i => i - 1);
        } else {
            this.currentIndex.set(pages.length - 1);
        }
    }

    isLive(event: Evento): boolean {
        const now = new Date();
        return event.dataInicioEvento <= now && event.dataFimEvento >= now;
    }

    formatDate(date: Date): string {
        const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date);
        const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '');
        return `${day}/${month}`;
    }

    formatTime(date: Date): string {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}
