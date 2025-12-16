import { Component, signal, ElementRef, ViewChild, Inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Monitor, Image as ImageIcon, Type, Move, Trash2, Download,
  Palette, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Layers
} from 'lucide-angular';
import html2canvas from 'html2canvas';

type ElementType = 'text' | 'image';

interface ScreenElement {
  id: string;
  type: ElementType;
  content: string; // Text content or Image DataURL
  x: number;
  y: number;
  width?: number; // For images
  height?: number; // For images
  style: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    borderRadius?: number;
    zIndex: number;
  };
}

const FONTS = [
  { name: 'Padrão (Inter)', value: 'Inter, sans-serif' },
  { name: 'Serifa', value: 'Georgia, serif' },
  { name: 'Monospaced', value: 'Courier New, monospace' },
  { name: 'Cursiva', value: 'cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' }
];

const COLORS = [
  '#ffffff', '#000000', '#f87171', '#fbbf24', '#34d399',
  '#60a5fa', '#818cf8', '#a78bfa', '#f472b6'
];

@Component({
  selector: 'app-screen-generator-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './screen-generator-page.html',
  styleUrl: './screen-generator-page.css',
})
export class ScreenGeneratorPage {
  // ViewChild
  @ViewChild('stageRef') stageRef!: ElementRef<HTMLDivElement>;

  // Icons
  readonly Monitor = Monitor;
  readonly ImageIcon = ImageIcon;
  readonly Type = Type;
  readonly Move = Move;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly Palette = Palette;
  readonly Bold = Bold;
  readonly Italic = Italic;
  readonly AlignLeft = AlignLeft;
  readonly AlignCenter = AlignCenter;
  readonly AlignRight = AlignRight;
  readonly Layers = Layers;

  // Constants
  readonly FONTS = FONTS;
  readonly COLORS = COLORS;

  // State
  elements = signal<ScreenElement[]>([]);
  selectedId = signal<string | null>(null);
  backgroundColor = signal('#1e293b');
  isDragging = signal(false);
  isExporting = signal(false);

  // Private state for drag logic
  private dragOffset = { x: 0, y: 0 };

  // Helper computed
  selectedElement = computed(() => this.elements().find(e => e.id === this.selectedId()));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  addText() {
    const newEl: ScreenElement = {
      id: Date.now().toString(),
      type: 'text',
      content: 'Novo Texto',
      x: 50,
      y: 50,
      style: {
        color: '#ffffff',
        fontSize: 48,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'left',
        zIndex: this.elements().length + 1
      }
    };
    this.elements.update(prev => [...prev, newEl]);
    this.selectedId.set(newEl.id);
  }

  addImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const img = new Image();
          img.src = ev.target.result as string;
          img.onload = () => {
            // Calculate aspect ratio to fit nicely
            const maxSize = 400;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);

            const newEl: ScreenElement = {
              id: Date.now().toString(),
              type: 'image',
              content: ev.target!.result as string,
              x: 100,
              y: 100,
              width: img.width * ratio,
              height: img.height * ratio,
              style: {
                zIndex: this.elements().length + 1
              }
            };
            this.elements.update(prev => [...prev, newEl]);
            this.selectedId.set(newEl.id);
          };
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    input.value = '';
  }

  // Element Updates
  updateElement(id: string, updates: any) {
    this.elements.update(prev => prev.map(el => {
      if (el.id === id) {
        const styleUpdates: any = {};
        const rootUpdates: any = {};

        // Handle image aspect ratio
        if (updates.maintainRatio && el.type === 'image' && updates.width) {
          const ratio = (el.height || 100) / (el.width || 100);
          updates.height = updates.width * ratio;
          delete updates.maintainRatio;
        }

        Object.entries(updates).forEach(([key, value]) => {
          if (['color', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'textAlign', 'backgroundColor', 'borderRadius', 'zIndex'].includes(key)) {
            styleUpdates[key] = value;
          } else {
            rootUpdates[key] = value;
          }
        });

        return {
          ...el,
          ...rootUpdates,
          style: { ...el.style, ...styleUpdates }
        };
      }
      return el;
    }));
  }

  // Wrapper for template usage which can't strictly type check dynamic keys easily
  updateSelectedElement(updates: any) {
    if (this.selectedId()) {
      this.updateElement(this.selectedId()!, updates);
    }
  }

  deleteElement(id: string) {
    this.elements.update(prev => prev.filter(e => e.id !== id));
    this.selectedId.set(null);
  }

  bringToFront(id: string) {
    const maxZ = Math.max(...this.elements().map(e => e.style.zIndex || 0));
    this.updateElement(id, { zIndex: maxZ + 1 });
  }

  // Drag Logic
  handleMouseDown(e: MouseEvent, id: string) {
    e.stopPropagation();
    this.selectedId.set(id);
    this.isDragging.set(true);

    const el = this.elements().find(el => el.id === id);
    if (el && this.stageRef?.nativeElement) {
      const rect = this.stageRef.nativeElement.getBoundingClientRect();
      const scaleX = 1920 / rect.width;
      const scaleY = 1080 / rect.height;

      this.dragOffset = {
        x: (e.clientX - rect.left) * scaleX - el.x,
        y: (e.clientY - rect.top) * scaleY - el.y
      };
    }
  }

  handleMouseMove(e: MouseEvent) {
    if (this.isDragging() && this.selectedId() && this.stageRef?.nativeElement) {
      const rect = this.stageRef.nativeElement.getBoundingClientRect();
      const scaleX = 1920 / rect.width;
      const scaleY = 1080 / rect.height;

      const newX = (e.clientX - rect.left) * scaleX - this.dragOffset.x;
      const newY = (e.clientY - rect.top) * scaleY - this.dragOffset.y;

      this.updateElement(this.selectedId()!, { x: newX, y: newY });
    }
  }

  handleMouseUp() {
    this.isDragging.set(false);
  }

  // Export Logic
  handleExport() {
    if (!this.stageRef?.nativeElement || !isPlatformBrowser(this.platformId)) return;
    this.isExporting.set(true);
    const currentSelection = this.selectedId();
    this.selectedId.set(null); // Deselect to remove borders

    setTimeout(async () => {
      try {
        const stageEl = this.stageRef.nativeElement;
        const canvas = await html2canvas(stageEl, {
          scale: 3840 / stageEl.offsetWidth, // Force 4K width scale
          useCORS: true,
          backgroundColor: null,
          logging: false
        });

        const link = document.createElement('a');
        link.download = `telao-colabbs-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (err) {
        console.error("Export failed", err);
        alert("Erro ao exportar imagem.");
      } finally {
        this.isExporting.set(false);
        // We don't restore selection immediately to avoid "flashing", but user can re-select
      }
    }, 100);
  }
}
