import { Directive } from '@angular/core';
import { BaseAnimationDirective } from './base';
import { animate, style } from '@angular/animations';

@Directive({
    standalone: true,
    selector: '[animateFadeUp]', // Renamed for clarity: Standard "Fade Up" effect
})
export class AnimateFadeUpDirective extends BaseAnimationDirective {
    protected override initializeAnimation() {
        const factory = this.animationBuilder.build([
            // Start state: slightly down and invisible
            style({ opacity: 0, transform: 'translateY(30px)', filter: 'blur(2px)' }),
            animate(
                this.duration + ' ' + this.easing,
                style({ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' })
            ),
        ]);
        this.player = factory.create(this.el.nativeElement);
    }
}
