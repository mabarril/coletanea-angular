import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, Shuffle, Copy, Check, Trash2, UserPlus, Grid } from 'lucide-angular';

@Component({
  selector: 'app-team-generator-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './team-generator-page.html',
  styleUrl: './team-generator-page.css',
})
export class TeamGeneratorPage {
  // Icons
  readonly Users = Users;
  readonly Shuffle = Shuffle;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly Trash2 = Trash2;
  readonly UserPlus = UserPlus;
  readonly Grid = Grid;

  // State
  namesInput = signal('');
  numberOfTeams = signal(2);
  teams = signal<string[][]>([]);
  isGenerated = signal(false);
  copiedIndex = signal<number | null>(null);

  handleGenerate() {
    const names = this.namesInput().split('\n').map(n => n.trim()).filter(n => n.length > 0);

    if (names.length === 0) return;
    if (this.numberOfTeams() > names.length) {
      alert('O número de times não pode ser maior que o número de pessoas!');
      return;
    }

    // Fisher-Yates Shuffle
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Distribute into teams
    const newTeams: string[][] = Array.from({ length: this.numberOfTeams() }, () => []);

    shuffled.forEach((name, index) => {
      const teamIndex = index % this.numberOfTeams();
      newTeams[teamIndex].push(name);
    });

    this.teams.set(newTeams);
    this.isGenerated.set(true);
  }

  copyTeam(teamIndex: number, members: string[]) {
    const text = `Time ${teamIndex + 1}:\n${members.join('\n')}`;
    navigator.clipboard.writeText(text);
    this.copiedIndex.set(teamIndex);
    setTimeout(() => this.copiedIndex.set(null), 2000);
  }

  clearAll() {
    this.namesInput.set('');
    this.teams.set([]);
    this.isGenerated.set(false);
  }

  // Helper to handle Range Input which returns string
  onRangeChange(e: any) {
    this.numberOfTeams.set(parseInt(e.target.value));
  }
}
