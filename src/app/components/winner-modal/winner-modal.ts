import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Trophy } from 'lucide-angular';

import { WheelItem } from '../../types';

@Component({
  selector: 'app-winner-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './winner-modal.html',
  styleUrl: './winner-modal.css',
})
export class WinnerModal {
  winner = input<WheelItem | null>(null);
  close = output<void>();

  readonly X = X;
  readonly Trophy = Trophy;
}
