import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ui-gallery',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ui-gallery.component.html',
    styleUrl: './ui-gallery.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGalleryComponent implements OnInit {
    @Input() images: string[];
    cdr = inject(ChangeDetectorRef);

    @ViewChild('mainImageContainer') mainImageContainer!: ElementRef;
    selectedImage: string;

    // Lens properties
    lensTop: number = 0;
    lensLeft: number = 0;
    showLens: boolean = false;

    // Zoom window properties
    zoomPosition: string = '0% 0%';
    zoomBackgroundSize: string = '200%'; // 2x Zoom default

    currentIndex: number = 0;
    opacity: number = 1;
    private hoverTimeout: any;

    ngOnInit(): void {
        if (this.images?.length) {
            this.selectedImage = this.images[0];
        }
    }

    changeSelectedImage(image: string, newIndex: number) {
        if (this.selectedImage === image) return;

        // Immediate update for click/hover
        this.startTransition(image, newIndex);
    }

    // Smooth transition logic
    private startTransition(image: string, index: number) {
        // Fade out
        this.opacity = 0.5;
        this.cdr.markForCheck();

        // Short delay to allow fade out effect, then swap and fade in
        setTimeout(() => {
            this.selectedImage = image;
            this.currentIndex = index;
            this.opacity = 1;
            this.cdr.markForCheck();
        }, 150);
    }

    onImageHover(event: MouseEvent) {
        const container = this.mainImageContainer.nativeElement;
        const rect = container.getBoundingClientRect();

        // Mouse coordinates relative to container
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const containerWidth = rect.width;
        const containerHeight = rect.height;

        // Lens dimensions (should match SCSS, e.g., 100px or calculated)
        // For 2x zoom with a 400px window, lens should be 200px.
        // Let's assume a fixed lens size for simplicity or a ratio.
        // If zoom window is approx same size as main image, and zoom is 2x, 
        // lens should be half the size of main image.
        const lensWidth = containerWidth / 2.5;
        const lensHeight = containerHeight / 2.5;

        // Calculate lens position (centered on mouse, clamped to container)
        let newLeft = x - lensWidth / 2;
        let newTop = y - lensHeight / 2;

        // Clamp values
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft > containerWidth - lensWidth) newLeft = containerWidth - lensWidth;
        if (newTop > containerHeight - lensHeight) newTop = containerHeight - lensHeight;

        this.lensLeft = newLeft;
        this.lensTop = newTop;
        this.showLens = true;

        // Calculate Zoom Background Position
        // Ratio of lens movement 
        const fx = newLeft / (containerWidth - lensWidth);
        const fy = newTop / (containerHeight - lensHeight);

        // Percentage based position is easiest if background-size is consistent
        // But for exact pixel match:
        // bgX = -newLeft * zoomFactor
        // zoomFactor = zoomWindowSize / lensSize

        // Using percentage for background-position logic:
        // 0% -> left edge, 100% -> right edge
        this.zoomPosition = `${fx * 100}% ${fy * 100}%`;
    }

    onImageLeave() {
        this.showLens = false;
    }
}
