import { Component, computed, signal, effect, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { LucideAngularModule, Sparkles } from 'lucide-angular';
import confetti from 'canvas-confetti';

import { Wheel } from './components/wheel/wheel';
import { WheelControls } from './components/wheel-controls/wheel-controls';
import { WinnerModal } from '../../components/winner-modal/winner-modal';
import { WheelItem } from '../../types';
import { WHEEL_COLORS, INITIAL_ITEMS, SPIN_DURATION_SECONDS, MIN_SPINS } from '../../constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

@Component({
  selector: 'app-wheel-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, Wheel, WheelControls, WinnerModal, NgOptimizedImage],
  templateUrl: './wheel-page.html',
  styleUrl: './wheel-page.css',
})
export class WheelPage {
  readonly Sparkles = Sparkles;

  items = signal<WheelItem[]>(
    INITIAL_ITEMS.map((item, index) => ({
      id: generateId(),
      label: item.label,
      quantity: item.quantity,
      color: WHEEL_COLORS[index % WHEEL_COLORS.length]
    }))
  );

  activeItems = computed(() => this.items().filter(i => i.quantity > 0));

  isSpinning = signal(false);
  rotation = signal(0);
  winner = signal<WheelItem | null>(null);

  spinDuration = SPIN_DURATION_SECONDS;

  private audio: HTMLAudioElement | null = null;
  private analytics = inject(AnalyticsService);

  constructor() {
    this.initAudio();
  }

  initAudio() {
    if (typeof Audio !== 'undefined') {
      this.audio = new Audio('assets/tada.mp3');
    }
  }

  playSound() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(e => console.warn("Audio play blocked or file missing", e));
    }
  }

  triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6, x: 0.5 }
    });
  }

  addItem(data: { label: string, quantity: number }) {
    this.items.update(prev => {
      const newItem: WheelItem = {
        id: generateId(),
        label: data.label,
        quantity: data.quantity,
        color: WHEEL_COLORS[prev.length % WHEEL_COLORS.length]
      };
      return [...prev, newItem];
    });
  }

  removeItem(id: string) {
    this.items.update(prev => {
      const newItems = prev.filter(i => i.id !== id);
      // Re-assign colors
      return newItems.map((item, index) => ({
        ...item,
        color: WHEEL_COLORS[index % WHEEL_COLORS.length]
      }));
    });
  }

  updateQuantity(data: { id: string, delta: number }) {
    this.items.update(prev => prev.map(item => {
      if (item.id === data.id) {
        const newQty = Math.max(0, item.quantity + data.delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }

  handleSpin() {
    const active = this.activeItems();
    if (active.length < 2 || this.isSpinning()) return;

    this.isSpinning.set(true);
    this.winner.set(null);

    this.analytics.trackEvent('spin_wheel', {
      item_count: active.length
    });

    // 1. Determine Winner
    const winnerIndex = Math.floor(Math.random() * active.length);
    const winnerItem = active[winnerIndex];

    // 2. Calculate Math
    const sliceAngle = 360 / active.length;

    // We render items starting from Top (0 relative degrees in Wheel logic).
    // Center of the winner slice
    const centerAngle = (winnerIndex * sliceAngle) + (sliceAngle / 2);

    // Target rotation is negative to rotate counter-clockwise to that position
    let targetRotation = -centerAngle;

    // Add randomness (jitter)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.8);
    targetRotation += jitter;

    // 3. Handle Spins accumulation
    const fullSpins = 360 * MIN_SPINS;
    const currentRotation = this.rotation();
    const minDesiredRotation = currentRotation + fullSpins;

    // Calculate how many full 360s we need to add to reach at least minDesired, 
    // respecting the target angle mod 360.
    // Actually the logic in React was simpler: just add full spins to reach target relative to current.
    // But since targetRotation defines the FINAL ANGLE mod 360, we need to find N such that
    // targetRotation + N*360 > currentRotation + fullSpins.

    // Let's stick to the React logic:
    // const rotationsToAdd = Math.ceil((minDesiredRotation - targetRotation) / 360);
    // const finalRotation = targetRotation + (rotationsToAdd * 360);

    const rotationsToAdd = Math.ceil((minDesiredRotation - targetRotation) / 360);
    const finalRotation = targetRotation + (rotationsToAdd * 360);

    this.rotation.set(finalRotation);

    // 4. Wait for animation
    setTimeout(() => {
      this.isSpinning.set(false);
      this.winner.set(winnerItem);
      this.playSound();
      this.triggerConfetti();

      this.analytics.trackEvent('wheel_winner', {
        label: winnerItem.label
      });

      // Decrement quantity
      this.updateQuantity({ id: winnerItem.id, delta: -1 });
    }, SPIN_DURATION_SECONDS * 1000);
  }

  closeModal() {
    this.winner.set(null);
  }
}
