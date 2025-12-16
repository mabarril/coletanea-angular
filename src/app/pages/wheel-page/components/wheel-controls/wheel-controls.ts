import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus, Minus, AlertCircle } from 'lucide-angular';
import { WheelItem } from '../../../../types';

@Component({
  selector: 'app-wheel-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './wheel-controls.html',
  styleUrl: './wheel-controls.css',
})
export class WheelControls {
  items = input.required<WheelItem[]>();
  activeCount = input.required<number>();
  isSpinning = input.required<boolean>();

  addItem = output<{ label: string; quantity: number }>();
  removeItem = output<string>();
  updateQuantity = output<{ id: string; delta: number }>();

  // Use signals for local state
  newItemLabel = signal('');
  newItemQuantity = signal(1);
  error = signal<string | null>(null);

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly AlertCircle = AlertCircle;

  sortedItems = computed(() => {
    return [...this.items()].sort((a, b) => {
      // Priority 1: Items with quantity > 0 come first
      if (a.quantity > 0 && b.quantity === 0) return -1;
      if (a.quantity === 0 && b.quantity > 0) return 1;

      // Priority 2: Higher quantity first
      return b.quantity - a.quantity;
    });
  });

  handleAdd(e: Event) {
    e.preventDefault();
    const trimmed = this.newItemLabel().trim();

    if (!trimmed) {
      this.error.set('O nome do item não pode ser vazio');
      return;
    }

    if (this.items().some(i => i.label.toLowerCase() === trimmed.toLowerCase())) {
      this.error.set('Este item já existe');
      return;
    }

    if (this.newItemQuantity() < 1) {
      this.error.set('A quantidade mínima é 1');
      return;
    }

    this.addItem.emit({ label: trimmed, quantity: this.newItemQuantity() });
    this.newItemLabel.set('');
    this.newItemQuantity.set(1);
    this.error.set(null);
  }

  onLabelChange(value: string) {
    this.newItemLabel.set(value);
    if (this.error()) this.error.set(null);
  }

  onQuantityChange(value: number) {
    this.newItemQuantity.set(value || 1);
  }
}
