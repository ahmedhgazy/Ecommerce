import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-timer-digit',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './timer-digit.component.html',
  styleUrls: ['./timer-digit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerDigitComponent implements OnChanges {
  @Input() value: number = 0;
  @Input() label: string = '';

  currentValue = signal(0);
  previousValue = signal(0);
  isAnimating = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const prev = changes['value'].previousValue ?? this.value;
      const curr = changes['value'].currentValue;

      if (prev !== curr) {
        this.previousValue.set(prev);
        this.currentValue.set(curr);
        this.triggerAnimation();
      } else {
          this.currentValue.set(curr);
      }
    }
  }

  triggerAnimation() {
    this.isAnimating.set(false);
    // Force reflow to restart animation if needed, though usually seconds tick safely
    setTimeout(() => {
        this.isAnimating.set(true);
    }, 10);
    
    // Reset after animation duration (match SCSS duration)
    setTimeout(() => {
        this.isAnimating.set(false);
        this.previousValue.set(this.currentValue());
    }, 600); 
  }
}
