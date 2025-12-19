import { Component, signal, ElementRef, ViewChild, Inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Monitor, Image as ImageIcon, Type, Move, Trash2, Download,
  Palette, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Layers,
  Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown
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
  locked?: boolean;
  hidden?: boolean;
  style: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
    textShadow?: string;
    boxShadow?: string;
    shadowColor?: string;
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
  host: {
    '(window:keydown)': 'handleKeyDown($event)'
  }
})
export class ScreenGeneratorPage {
  // Constants
  readonly FONTS = FONTS;
  readonly COLORS = COLORS;

  isNativeFont(fontFamily: string | undefined): boolean {
    if (!fontFamily) return true;
    return FONTS.some(f => f.value === fontFamily);
  }
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
  readonly Lock = Lock;
  readonly Unlock = Unlock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;

  // State
  elements = signal<ScreenElement[]>([]);
  selectedId = signal<string | null>(null);
  backgroundColor = signal('#1e293b');
  backgroundColor2 = signal('#334155');
  gradientAngle = signal(135);
  isGradient = signal(false);
  isDragging = signal(false);
  isExporting = signal(false);
  localFonts = signal<{ name: string, value: string }[]>([]);

  // Available fonts (base + local)
  availableFonts = computed(() => [
    ...FONTS,
    ...this.localFonts(),
    { name: '--- Personalizada ---', value: 'custom' }
  ]);

  stageBackground = computed(() => {
    if (this.isGradient()) {
      return `linear-gradient(${this.gradientAngle()}deg, ${this.backgroundColor()}, ${this.backgroundColor2()})`;
    }
    return this.backgroundColor();
  });

  // Private state for drag logic
  private dragOffset = { x: 0, y: 0 };

  // Helper computed
  selectedElement = computed(() => this.elements().find(e => e.id === this.selectedId()));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkLocalFontSupport();
    }
  }

  async checkLocalFontSupport() {
    // Check if the API exists
    if ('queryLocalFonts' in window) {
      try {
        // We don't auto-query to avoid immediate permission prompt, 
        // but we could. For now, let's just leave it ready.
      } catch (e) {
        console.warn("Local font access denied or failed", e);
      }
    }
  }

  async loadLocalFonts() {
    if ('queryLocalFonts' in window) {
      try {
        const fonts = await (window as any).queryLocalFonts();
        const uniqueFonts = Array.from(new Set(fonts.map((f: any) => f.family)))
          .sort()
          .map((family: any) => ({ name: family, value: family }));

        this.localFonts.set(uniqueFonts);
      } catch (e) {
        console.error("Error querying local fonts", e);
        alert("Não foi possível acessar as fontes locais. Verifique as permissões do navegador.");
      }
    } else {
      alert("Seu navegador não suporta acesso direto a fontes locais. Você pode digitar o nome da fonte manualmente.");
    }
  }

  toggleGradient() {
    this.isGradient.update(v => !v);
  }

  toggleLock(id: string) {
    this.elements.update(prev => prev.map(el =>
      el.id === id ? { ...el, locked: !el.locked } : el
    ));
    if (this.selectedId() === id && this.elements().find(e => e.id === id)?.locked) {
      // Keep selected for now but logic below will block interaction
    }
  }

  toggleVisibility(id: string) {
    this.elements.update(prev => prev.map(el =>
      el.id === id ? { ...el, hidden: !el.hidden } : el
    ));
  }

  moveLayerUp(id: string) {
    this.elements.update(prev => {
      const index = prev.findIndex(el => el.id === id);
      if (index >= prev.length - 1) return prev;
      const newElements = [...prev];
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      return newElements;
    });
  }

  moveLayerDown(id: string) {
    this.elements.update(prev => {
      const index = prev.findIndex(el => el.id === id);
      if (index <= 0) return prev;
      const newElements = [...prev];
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      return newElements;
    });
  }

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
        opacity: 1,
        textShadow: 'none',
        shadowColor: 'rgba(0,0,0,0.5)',
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
              width: Math.round(img.width * ratio),
              height: Math.round(img.height * ratio),
              style: {
                opacity: 1,
                boxShadow: 'none',
                shadowColor: 'rgba(0,0,0,0.5)',
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
          if (['color', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'textAlign', 'backgroundColor', 'borderRadius', 'opacity', 'textShadow', 'boxShadow', 'shadowColor', 'zIndex'].includes(key)) {
            styleUpdates[key] = value;
          } else {
            // Coerce width and height to numbers if they are strings from input range
            if ((key === 'width' || key === 'height') && typeof value === 'string') {
              rootUpdates[key] = parseFloat(value);
            } else {
              rootUpdates[key] = value;
            }
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

  fillScreen(id: string) {
    const el = this.elements().find(e => e.id === id);
    if (el && el.type === 'image') {
      // Calculate covers for 1920x1080
      // We want to cover the whole 16:9 stage. 
      // Simplified: Force width to 1920 and center Y, or force height to 1080 and center X.
      // But for a simple "Background" vibe, let's just force 1920x1080 and reset X,Y to 0
      // if they want it as a true background. Or keep ratio.

      // Let's do "Cover" logic (simplified: force 1920 and calculate height, then center Y)
      const stageW = 1920;
      const stageH = 1080;
      const img = new Image();
      img.src = el.content;
      img.onload = () => {
        const ratio = img.width / img.height;
        let newW, newH, newX, newY;

        if (ratio > stageW / stageH) {
          // Image is wider than stage
          newH = stageH;
          newW = stageH * ratio;
          newX = (stageW - newW) / 2;
          newY = 0;
        } else {
          // Image is taller than stage
          newW = stageW;
          newH = stageW / ratio;
          newX = 0;
          newY = (stageH - newH) / 2;
        }

        this.updateElement(id, {
          x: newX,
          y: newY,
          width: Math.round(newW),
          height: Math.round(newH)
        });
      };
    }
  }

  // Keyboard Shortcuts
  handleKeyDown(e: KeyboardEvent) {
    // If typing in textarea or input, don't trigger shortcuts
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

    const selected = this.selectedElement();
    if (!selected || selected.locked) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteElement(selected.id);
      e.preventDefault();
    } else if (e.key.startsWith('Arrow')) {
      const step = e.shiftKey ? 10 : 1;
      // const el = this.elements().find(el => el.id === selectedId); // 'selected' is already the element
      if (selected) {
        let { x, y } = selected;
        if (e.key === 'ArrowLeft') x -= step;
        else if (e.key === 'ArrowRight') x += step;
        else if (e.key === 'ArrowUp') y -= step;
        else if (e.key === 'ArrowDown') y += step;

        this.updateElement(selected.id, { x, y });
        e.preventDefault();
      }
    }
  }

  // Drag Logic
  handleMouseDown(e: MouseEvent, id: string) {
    const el = this.elements().find(e => e.id === id);
    if (el?.locked || el?.hidden) return;

    this.selectedId.set(id);
    this.isDragging.set(true);

    // const el = this.elements().find(el => el.id === id); // Already defined above
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
