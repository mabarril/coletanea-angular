import { Component, signal, ElementRef, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, FileText, Trash2, Trophy, RefreshCw, AlertCircle } from 'lucide-angular';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-raffle-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './raffle-page.html',
  styleUrl: './raffle-page.css',
})
export class RafflePage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  items = signal<string[]>([]);
  inputText = signal('');
  drawQuantity = signal(1);
  winners = signal<string[]>([]);
  isProcessing = signal(false);

  // Icons
  readonly Upload = Upload;
  readonly FileText = FileText;
  readonly Trash2 = Trash2;
  readonly Trophy = Trophy;
  readonly RefreshCw = RefreshCw;
  readonly AlertCircle = AlertCircle;

  // Computed max draw quantity
  maxDrawQuantity = computed(() => Math.max(1, this.items().length));

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'txt' || extension === 'csv') {
        const text = await file.text();
        // Split by newlines or commas
        const rawItems = text.split(/[\n,]+/).map(i => i.trim()).filter(i => i);
        this.addItems(rawItems);
      } else if (['xls', 'xlsx'].includes(extension || '')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        if (workbook.SheetNames.length > 0) {
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          // header: 1 returns array of arrays
          const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[];
          const flatData = data.flat().map((i: any) => String(i).trim()).filter((i: any) => i);
          this.addItems(flatData);
        }
      } else {
        alert('Formato não suportado. Use .txt, .csv, .xls ou .xlsx');
      }
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      alert("Erro ao ler o arquivo. Verifique o formato.");
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  addItems(newItems: string[]) {
    const uniqueItems = newItems.filter(i => i.length > 0);
    this.items.update(prev => [...prev, ...uniqueItems]);

    this.inputText.update(prev => {
      const separator = prev && !prev.endsWith('\n') ? '\n' : '';
      return prev + separator + uniqueItems.join('\n');
    });
  }

  handleManualTextChange(value: string) {
    this.inputText.set(value);
    const lines = value.split('\n').map(l => l.trim()).filter(l => l);
    this.items.set(lines);
  }

  inputQty(value: any) {
    const val = parseInt(value);
    this.drawQuantity.set(isNaN(val) ? 1 : val);
  }

  clearAll() {
    if (confirm('Tem certeza que deseja limpar tudo?')) {
      this.items.set([]);
      this.inputText.set('');
      this.winners.set([]);
      this.drawQuantity.set(1);
    }
  }

  handleDraw() {
    const currentItems = this.items();
    if (currentItems.length === 0) return;

    this.isProcessing.set(true);

    setTimeout(() => {
      const qty = Math.min(this.drawQuantity(), currentItems.length);
      const newWinners: string[] = [];
      const remainingItems = [...currentItems];

      for (let i = 0; i < qty; i++) {
        const randomIndex = Math.floor(Math.random() * remainingItems.length);
        newWinners.push(remainingItems[randomIndex]);
        remainingItems.splice(randomIndex, 1);
      }

      this.winners.update(prev => [...newWinners, ...prev]);
      this.items.set(remainingItems);
      this.inputText.set(remainingItems.join('\n'));

      this.triggerEffect();
      this.isProcessing.set(false);

    }, 800);
  }

  triggerEffect() {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6, x: 0.5 }
    });

    const audio = new Audio('assets/tada.mp3');
    audio.play().catch(() => { });
  }
}
