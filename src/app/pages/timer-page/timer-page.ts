import { Component, signal, effect, computed, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Watch, Timer, Play, Pause, RotateCcw, ChevronUp, ChevronDown, AlarmClock } from 'lucide-angular';

type Mode = 'stopwatch' | 'timer';

@Component({
  selector: 'app-timer-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './timer-page.html',
  styleUrl: './timer-page.css',
})
export class TimerPage implements OnDestroy {
  // Icons
  readonly Watch = Watch;
  readonly Timer = Timer;
  readonly Play = Play;
  readonly Pause = Pause;
  readonly RotateCcw = RotateCcw;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  readonly AlarmClock = AlarmClock;

  // State
  mode = signal<Mode>('timer');
  isActive = signal(false);
  time = signal(0); // Current time in ms
  initialTime = signal(0); // For timer progress calculation

  // Inputs
  inputMinutes = signal(5);
  inputSeconds = signal(0);

  private intervalRef: any = null;
  private audio: HTMLAudioElement | null = null;

  // Computed for Display
  formatted = computed(() => {
    const ms = this.time();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0'),
      ms: milliseconds.toString().padStart(2, '0')
    };
  });

  // Computed for SVG
  progressCircle = computed(() => {
    // We use a fixed viewBox of 0 0 300 300
    // Radius 130 leaves 20px padding for stroke (strokeWidth 12-16)
    const radius = 130;
    const circumference = 2 * Math.PI * radius;

    let progress = 1;
    if (this.mode() === 'timer' && this.initialTime() > 0) {
      progress = this.time() / this.initialTime();
    } else if (this.mode() === 'stopwatch') {
      progress = 1; // Always full ring for stopwatch
    }

    const strokeDashoffset = circumference - (progress * circumference);

    return { strokeDashoffset, circumference, radius };
  });

  // Computed for Theme Color
  themeColor = computed(() => {
    if (this.mode() === 'stopwatch') return 'text-cyan-400 stroke-cyan-400';
    if (this.time() === 0 && this.initialTime() !== 0) return 'text-slate-400 stroke-slate-400';

    const percentage = this.time() / this.initialTime();

    if (percentage <= 0.1) return 'text-red-500 stroke-red-500 animate-pulse'; // Last 10%
    if (percentage <= 0.3) return 'text-orange-400 stroke-orange-400'; // Last 30%
    return 'text-cyan-400 stroke-cyan-400'; // Normal
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio('assets/tada.mp3');
    }
  }

  toggleTimer() {
    this.isActive.update(v => !v);
    this.checkInterval();
  }

  checkInterval() {
    if (this.isActive()) {
      if (!this.intervalRef && isPlatformBrowser(this.platformId)) {
        this.intervalRef = setInterval(() => {
          this.time.update(prevTime => {
            if (this.mode() === 'stopwatch') {
              return prevTime + 10;
            } else {
              // Timer mode
              if (prevTime <= 10) {
                this.clearTimer();
                this.isActive.set(false);
                if (this.audio) this.audio.play().catch(() => { });
                return 0;
              }
              return prevTime - 10;
            }
          });
        }, 10);
      }
    } else {
      this.clearTimer();
    }
  }

  clearTimer() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  resetTimer() {
    this.isActive.set(false);
    this.clearTimer();

    if (this.mode() === 'stopwatch') {
      this.time.set(0);
    } else {
      // Reset to last configured input
      const totalMs = (this.inputMinutes() * 60 * 1000) + (this.inputSeconds() * 1000);
      this.time.set(totalMs);
      this.initialTime.set(totalMs);
    }
  }

  setMode(m: Mode) {
    this.isActive.set(false);
    this.clearTimer();
    this.mode.set(m);
    if (m === 'stopwatch') {
      this.time.set(0);
    } else {
      const totalMs = (this.inputMinutes() * 60 * 1000) + (this.inputSeconds() * 1000);
      this.time.set(totalMs);
      this.initialTime.set(totalMs);
    }
  }

  adjustInput(type: 'min' | 'sec', val: number) {
    if (type === 'min') {
      this.inputMinutes.update(prev => Math.max(0, Math.min(99, prev + val)));
    } else {
      this.inputSeconds.update(prev => {
        let newVal = prev + val;
        if (newVal > 59) {
          this.adjustInput('min', 1);
          return 0;
        }
        if (newVal < 0) {
          if (this.inputMinutes() > 0) {
            this.adjustInput('min', -1);
            return 59;
          }
          return 0;
        }
        return newVal;
      });
    }

    // If we adjust inputs while NOT active, update the preview time
    if (!this.isActive() && this.mode() === 'timer') {
      // A small timeout or effect might be better, but doing it directly is simpler
      // We do this to sync the "preview" time on the ring
      setTimeout(() => {
        const totalMs = (this.inputMinutes() * 60 * 1000) + (this.inputSeconds() * 1000);
        this.time.set(totalMs);
        this.initialTime.set(totalMs);
      });
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
