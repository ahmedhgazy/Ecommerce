import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-image-preview',
    templateUrl: './image-preview.component.html',
    styleUrl: './image-preview.component.scss',
    imports: [CommonModule]
})
export class ImagePreviewComponent {
    @Input() imageUrl: string;
    isLoading = true;

    constructor(public activeModal: NgbActiveModal) {}
}
