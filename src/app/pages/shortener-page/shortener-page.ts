import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Scissors, Link as LinkIcon, Copy, Check, AlertCircle, ArrowRight, History } from 'lucide-angular';

interface ShortenedLink {
  original: string;
  short: string;
  id: number;
}

@Component({
  selector: 'app-shortener-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './shortener-page.html',
  styleUrl: './shortener-page.css',
})
export class ShortenerPage {
  // Icons
  readonly Scissors = Scissors;
  readonly LinkIcon = LinkIcon;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly AlertCircle = AlertCircle;
  readonly ArrowRight = ArrowRight;
  readonly History = History;

  // State
  url = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  history = signal<ShortenedLink[]>([]);
  copiedId = signal<number | null>(null);

  async handleShorten(e: Event) {
    e.preventDefault();
    if (!this.url().trim()) return;

    // Basic validation / Prepending https if missing
    let formattedUrl = this.url().trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    this.setLoading(true);
    this.setError(null);

    try {
      // Using TinyURL's simple public API
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(formattedUrl)}`);

      if (!response.ok) {
        throw new Error('Falha ao conectar com o serviço.');
      }

      const shortUrl = await response.text();

      if (shortUrl.startsWith('http')) {
        const newItem: ShortenedLink = {
          original: formattedUrl,
          short: shortUrl,
          id: Date.now()
        };
        this.history.update(prev => [newItem, ...prev]);
        this.url.set(''); // Clear input on success
      } else {
        throw new Error('Resposta inválida do serviço.');
      }

    } catch (err) {
      console.error(err);
      this.setError('Não foi possível encurtar o link. Verifique a URL e tente novamente.');
    } finally {
      this.setLoading(false);
    }
  }

  copyToClipboard(text: string, id: number) {
    navigator.clipboard.writeText(text);
    this.copiedId.set(id);
    setTimeout(() => this.copiedId.set(null), 2000);
  }

  // Helpers to set signals cleanly from template or logic
  setLoading(val: boolean) { this.loading.set(val); }
  setError(val: string | null) { this.error.set(val); }
}
