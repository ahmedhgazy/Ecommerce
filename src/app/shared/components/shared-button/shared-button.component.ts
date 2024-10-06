import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-shared-button',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './shared-button.component.html',
    styleUrl: './shared-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedButton {
    @Output() loadMoreEvent = new EventEmitter<void>();
    @Input()
    allLoaded = false;
    onClick() {
        this.loadMoreEvent.emit();
    }
}
