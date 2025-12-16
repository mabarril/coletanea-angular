import { Component, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, QrCode, Download, Link as LinkIcon, AlertCircle } from 'lucide-angular';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qrcode-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './qrcode-page.html',
  styleUrl: './qrcode-page.css',
})
export class QRCodePage {
  // Icons
  readonly QrCode = QrCode;
  readonly Download = Download;
  readonly LinkIcon = LinkIcon;
  readonly AlertCircle = AlertCircle;

  // State
  url = signal('');
  qrImage = signal<string | null>(null);
  error = signal<string | null>(null);

  private debounceTimer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Effect to trigger generation when URL changes
    effect(() => {
      const currentUrl = this.url();
      if (isPlatformBrowser(this.platformId)) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.generateQR(currentUrl);
        }, 500);
      }
    });
  }

  async generateQR(text: string) {
    if (!text.trim()) {
      this.qrImage.set(null);
      this.error.set(null);
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 800,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      this.qrImage.set(dataUrl);
      this.error.set(null);
    } catch (err) {
      console.error(err);
      this.error.set('Erro ao gerar QR Code.');
    }
  }

  handleDownload() {
    const img = this.qrImage();
    if (!img || !isPlatformBrowser(this.platformId)) return;

    const link = document.createElement('a');
    link.href = img;
    link.download = `qrcode-colabbs-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
