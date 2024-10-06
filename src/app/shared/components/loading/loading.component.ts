import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from './loading.service';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [ProgressSpinnerModule, CommonModule],
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss',
})
export class LoadingComponent {
    loadingService: LoadingService = inject(LoadingService);
}
