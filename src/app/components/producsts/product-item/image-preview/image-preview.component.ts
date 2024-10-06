import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    standalone: true,
    selector: 'app-image-preview',
    template: `
        <div class="modal-header">
            <button
                type="button"
                class="close border-0 bg-secondary"
                aria-label="Close"
                (click)="activeModal.dismiss('Cross click')"
            >
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div
            class="modal-body d-flex justify-content-center align-items-center"
        >
            <img [src]="imageUrl" class="img-fluid" alt="Product Image" />
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
                background-color: #000000;
            }
            .modal-header {
                border-bottom: none;
                padding: 1rem;
            }
            .close {
                color: white;
                border: 0 !important;
                outline: none !important;
                border-radius: 4px;
            }
            .modal-body {
                height: calc(100vh - 56px);
            }
            img {
                max-height: 100%;
                max-width: 100%;
                object-fit: contain;
            }
        `,
    ],
})
export class ImagePreviewComponent {
    @Input() imageUrl: string;

    constructor(public activeModal: NgbActiveModal) {}
}
