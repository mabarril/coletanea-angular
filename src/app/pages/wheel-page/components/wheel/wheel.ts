import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { WheelItem } from '../../../../types';

@Component({
  selector: 'app-wheel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './wheel.html',
  styleUrl: './wheel.css',
})
export class Wheel {
  items = input.required<WheelItem[]>();
  rotation = input.required<number>();
  isSpinning = input.required<boolean>();
  spinDuration = input.required<number>();

  spin = output<void>();

  readonly ChevronDown = ChevronDown;

  private radius = 200;
  private center = 200;
  private totalSize = 400;

  isValid = computed(() => this.items().length >= 2);

  slices = computed(() => {
    const items = this.items();
    const numItems = items.length;
    const sliceAngle = 360 / numItems;

    return items.map((item, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = this.center + this.radius * Math.cos(startRad);
      const y1 = this.center + this.radius * Math.sin(startRad);
      const x2 = this.center + this.radius * Math.cos(endRad);
      const y2 = this.center + this.radius * Math.sin(endRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${this.center} ${this.center} L ${x1} ${y1} A ${this.radius} ${this.radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const midAngle = startAngle + sliceAngle / 2;
      const midRad = (midAngle - 90) * (Math.PI / 180);
      // Start text near the center button (radius ~15-20), so we start at 0.35
      const textRadius = this.radius * 0.35;
      const textX = this.center + textRadius * Math.cos(midRad);
      const textY = this.center + textRadius * Math.sin(midRad);

      return {
        pathData,
        color: item.color,
        label: item.label,
        textX,
        textY,
        midAngle,
        truncatedLabel: item.label.length > 12 ? item.label.substring(0, 10) + '...' : item.label
      };
    });
  });

  get transformStyle() {
    return {
      transform: `rotate(${this.rotation()}deg)`,
      transition: this.isSpinning()
        ? `transform ${this.spinDuration()}s cubic-bezier(0.2, 0, 0.2, 1)`
        : 'none'
    };
  }
}
