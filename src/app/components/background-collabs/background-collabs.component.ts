import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BackgroundAsset {
    id: number;
    path: string;
    top: number;
    left: number;
    size: number;
    rotation: number;
}

@Component({
    selector: 'app-background-collabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './background-collabs.component.html',
    styleUrl: './background-collabs.component.css'
})
export class BackgroundCollabsComponent implements OnInit {
    backgroundAssets: BackgroundAsset[] = [];

    readonly assetNames = [
        'Ellipse 837.svg', 'Ellipse 838.svg', 'Group-1.svg', 'Group.svg',
        'Rectangle 1536.svg', 'Rectangle 1537.svg', 'Rectangle 1539.svg',
        'Rectangle 1540.svg', 'Rectangle 1541.svg', 'Rectangle 1542.svg',
        'Union-1.svg', 'Union-2.svg', 'Union.svg', 'Vector-1.svg', 'Vector.svg'
    ];

    ngOnInit() {
        this.generateBackground();
    }

    generateBackground() {
        const assetsCount = 3;
        const newAssets: BackgroundAsset[] = [];
        const rotations = [0, 90, 180, 270];

        for (let i = 0; i < assetsCount; i++) {
            const assetName = this.assetNames[Math.floor(Math.random() * this.assetNames.length)];
            const rotation = rotations[Math.floor(Math.random() * rotations.length)];

            let top = 0;
            let left = 0;

            // Spread 3 items across Sides and Footer
            if (i === 0) { // Bottom area (Footer)
                top = Math.random() * 5 + 90; // 90% to 95%
                left = Math.random() * 60 + 20;
            } else if (i === 1) { // Left Mid-Lower
                top = Math.random() * 40 + 50; // 50% to 90% (Avoid top)
                left = Math.random() * 3 + 1;
            } else { // Right Mid-Lower
                top = Math.random() * 40 + 50; // 50% to 90% (Avoid top)
                left = Math.random() * 3 + 96;
            }

            newAssets.push({
                id: i,
                path: `assets/collabs/${assetName}`,
                top,
                left,
                size: Math.random() * 40 + 90, // Slightly larger for impact
                rotation
            });
        }

        this.backgroundAssets = newAssets;
    }
}
