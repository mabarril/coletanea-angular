import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Background asset interface
 */
interface BackgroundAsset {
    id: number;
    path: string;
    top: number;
    left: number;
    size: number;
    rotation: number;
}

/**
 * Configuration constants for background generation
 */
const BACKGROUND_CONFIG = {
    REGENERATE_INTERVAL_MS: 600000, // 10 minutes
    ASSETS_COUNT: 5,
    MIN_SIZE: 90,
    MAX_SIZE: 140,
    MAX_PLACEMENT_ATTEMPTS: 50,
    OVERLAP_THRESHOLD_VERTICAL: 15,
    OVERLAP_THRESHOLD_HORIZONTAL: 10
} as const;

/**
 * Component that displays randomly positioned background SVG assets.
 * Assets are regenerated every 10 minutes with collision detection
 * to prevent overlapping.
 */
@Component({
    selector: 'app-background-collabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './background-collabs.component.html',
    styleUrl: './background-collabs.component.css'
})
export class BackgroundCollabsComponent implements OnInit, OnDestroy {
    backgroundAssets: BackgroundAsset[] = [];
    private intervalId: ReturnType<typeof setInterval> | null = null;

    readonly assetNames = [
        'Ellipse 837.svg', 'Ellipse 838.svg', 'Group-1.svg', 'Group.svg',
        'Rectangle 1536.svg', 'Rectangle 1537.svg', 'Rectangle 1539.svg',
        'Rectangle 1540.svg', 'Rectangle 1541.svg', 'Rectangle 1542.svg',
        'Union-1.svg', 'Union-2.svg', 'Union.svg', 'Vector-1.svg', 'Vector.svg'
    ];

    /**
     * Initialize component and start background regeneration interval
     */
    ngOnInit(): void {
        this.generateBackground();
        this.intervalId = setInterval(() => {
            this.generateBackground();
        }, BACKGROUND_CONFIG.REGENERATE_INTERVAL_MS);
    }

    /**
     * Clean up interval on component destruction
     */
    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Generate random background assets with collision detection.
     * Distributes assets across bottom, left, and right areas of the screen.
     */
    generateBackground(): void {
        const newAssets: BackgroundAsset[] = [];
        const rotations = [0, 90, 180, 270];


        for (let i = 0; i < BACKGROUND_CONFIG.ASSETS_COUNT; i++) {
            const assetName = this.assetNames[Math.floor(Math.random() * this.assetNames.length)];
            const rotation = rotations[Math.floor(Math.random() * rotations.length)];

            let placed = false;
            let subAttempts = 0;

            while (!placed && subAttempts < BACKGROUND_CONFIG.MAX_PLACEMENT_ATTEMPTS) {
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
                    const vDiff = Math.abs(asset.top - top);
                    const hDiff = Math.abs(asset.left - left);

                    return vDiff < BACKGROUND_CONFIG.OVERLAP_THRESHOLD_VERTICAL &&
                        hDiff < BACKGROUND_CONFIG.OVERLAP_THRESHOLD_HORIZONTAL;
                });

                if (!overlap) {
                    const sizeRange = BACKGROUND_CONFIG.MAX_SIZE - BACKGROUND_CONFIG.MIN_SIZE;
                    newAssets.push({
                        id: i,
                        path: `assets/collabs/${assetName}`,
                        top,
                        left,
                        size: Math.random() * sizeRange + BACKGROUND_CONFIG.MIN_SIZE,
                        rotation
                    });
                    placed = true;
                }
            }

            // If asset couldn't be placed after max attempts, skip it to avoid overlaps
        }

        this.backgroundAssets = newAssets;
    }
}
