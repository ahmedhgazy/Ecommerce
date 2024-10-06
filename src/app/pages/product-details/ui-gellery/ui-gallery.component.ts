import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    OnInit,
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

    mainImageContainer!: ElementRef;
    selectedImage: string;
    zoomPosition: string = '0% 0%';
    currentIndex: number = 0;
    isImageChanging: boolean = false;
    direction: 'next' | 'prev' = 'next';

    ngOnInit(): void {
        if (this.images?.length) {
            this.selectedImage = this.images[0];
        }
    }

    changeSelectedImage(image: string, newIndex: number) {
        if (this.selectedImage !== image) {
            this.direction = newIndex > this.currentIndex ? 'next' : 'prev';
            this.isImageChanging = true;
            this.selectedImage = image;
            this.currentIndex = newIndex;
            this.cdr.detectChanges();
            setTimeout(() => {
                this.isImageChanging = false;
            }, 150);
        }
    }

    onImageHover(event: MouseEvent) {
        const { left, top, width, height } = (
            event.target as HTMLElement
        ).getBoundingClientRect();

        const relativeX = (event.clientX - left) / width;
        const relativeY = (event.clientY - top) / height;

        const zoomFactor = 2.5;

        const x = 100 * (relativeX * (zoomFactor - 1));
        const y = 100 * (relativeY * (zoomFactor - 1));

        this.zoomPosition = `${x}% ${y}%`;
    }

    onImageLeave() {
        this.zoomPosition = '0% 0%';
    }
}
