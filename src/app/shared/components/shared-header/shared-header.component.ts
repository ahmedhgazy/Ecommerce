import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AnimateFromLeftDirective } from '../../animations/scroll-animation/left';
import { AnimateFromRightDirective } from '../../animations/scroll-animation/right';

@Component({
    selector: 'app-shared-header',
    standalone: true,
    imports: [AnimateFromRightDirective],
    templateUrl: './shared-header.component.html',
    styleUrl: './shared-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedHeaderComponent {}
