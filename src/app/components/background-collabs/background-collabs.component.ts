import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class BackgroundCollabsComponent implements OnInit, OnDestroy {
    backgroundAssets: BackgroundAsset[] = [];
    private intervalId: any;

    readonly assetNames = [
        'Ellipse 837.svg', 'Ellipse 838.svg', 'Group-1.svg', 'Group.svg',
        'Rectangle 1536.svg', 'Rectangle 1537.svg', 'Rectangle 1539.svg',
        'Rectangle 1540.svg', 'Rectangle 1541.svg', 'Rectangle 1542.svg',
        'Union-1.svg', 'Union-2.svg', 'Union.svg', 'Vector-1.svg', 'Vector.svg'
    ];

    ngOnInit() {
        this.generateBackground();
        this.intervalId = setInterval(() => {
            this.generateBackground();
        }, 600000); // 10 minutes
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    generateBackground() {
        const assetsCount = 5;
        const newAssets: BackgroundAsset[] = [];
        const rotations = [0, 90, 180, 270];

        // Helper to check overlap
        const checkOverlap = (top: number, left: number, size: number, assets: BackgroundAsset[]): boolean => {
            // Convert % positions to rough relative units for comparison, or just compare roughly.
            // Since we are mixing % (position) and px (size), it's tricky.
            // Let's approximate: 1vh ~= 10px (assuming 1000px height), 1vw ~= 15px (assuming 1500px width).
            // Better approach for diversity: just check distance in % if possible, or convert size to % estimate.
            // Simplified approach: check if distance between centers is large enough.

            // However, top/left are %, size is px.
            // Let's assume a standard viewport for logic or just use a logic that separates them well.
            // A simple "grid" or "sector" approach might be rigid.
            // Let's try to convert everything to a normalized coordinate system or just ensure
            // the generated "area" (i==0, i==1...) doesn't overlap much.
            // But user said "gap relatively good".

            // Current bounds:
            // i=0 (Bottom): Top 80-90, Left 20-80
            // i=1 (Left): Top 20-80, Left 5-15
            // i=2 (Right): Top 20-80, Left 85-95

            // The areas are already quite disjoint!
            // i=0 is at bottom.
            // i=1 is left.
            // i=2 is right.
            //
            // If i goes up to 5, we have:
            // i=0: Bottom
            // i=1: Left
            // i=2: Right
            // i=3: ??? (Right Mid-Lower logic used for "else") -> Right again.
            // i=4: ??? (Right Mid-Lower logic used for "else") -> Right again.

            // Ah, the loop goes to 5.
            // i=0: Footer (Bottom)
            // i=1: Left Side
            // i=2, 3, 4: Right Side (based on current `else`). THIS IS THE PROBLEM.
            // 3 items on the right side will likely overlap.

            // We need to distribute them better.
            return false; // Replaced by inline logic below
        };

        const maxAttempts = 50;


        for (let i = 0; i < assetsCount; i++) {
            const assetName = this.assetNames[Math.floor(Math.random() * this.assetNames.length)];
            const rotation = rotations[Math.floor(Math.random() * rotations.length)];

            let placed = false;
            let subAttempts = 0;

            while (!placed && subAttempts < maxAttempts) {
                subAttempts++;
                let top = 0;
                let left = 0;

                // Distribute items more evenly:
                // 0: Bottom
                // 1, 2: Left
                // 3, 4: Right

                if (i === 0) { // Bottom
                    top = Math.random() * 10 + 85;
                    left = Math.random() * 75 + 20;
                } else if (i === 1 || i === 2) { // Left side
                    top = Math.random() * 80 + 15; // 15-75% vertical spread
                    left = Math.random() * 15 + 5;
                } else { // Right side
                    top = Math.random() * 80 + 15;
                    left = Math.random() * 10 + 85;
                }

                // Check overlap with existing assets
                const overlap = newAssets.some(asset => {
                    // Simple distance check.
                    // vertical diff approx: |a.top - b.top| (in %)
                    // horizontal diff approx: |a.left - b.left| (in %)
                    // Threshold: let's say 15% vertical, 10% horizontal buffer
                    const vDiff = Math.abs(asset.top - top);
                    const hDiff = Math.abs(asset.left - left);

                    return vDiff < 15 && hDiff < 10;
                });

                if (!overlap) {
                    newAssets.push({
                        id: i,
                        path: `assets/collabs/${assetName}`,
                        top,
                        left,
                        size: Math.random() * 50 + 90,
                        rotation
                    });
                    placed = true;
                }
            }

            // If not placed after max attempts, skip (or force place if strictness allows, but better skip to avoid ugly overlap)
            // Or try best effort? For now, if we can't place, we just don't add it or allow slight overlap?
            // Let's just skip to keep it clean.
        }

        this.backgroundAssets = newAssets;
    }
}
