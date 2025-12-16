import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, LayoutGrid, List, Sparkles, Trophy, ArrowRight, QrCode, Timer, Scissors, Users, Monitor, Gamepad2 } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly LayoutGrid = LayoutGrid;
  readonly List = List;
  readonly Sparkles = Sparkles;
  readonly Trophy = Trophy;
  readonly ArrowRight = ArrowRight;
  readonly QrCode = QrCode;
  readonly Timer = Timer;
  readonly Scissors = Scissors;
  readonly Users = Users;
  readonly Monitor = Monitor;
  readonly Gamepad2 = Gamepad2;

  protected readonly year = new Date().getFullYear();
}
