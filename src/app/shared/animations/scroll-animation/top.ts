import { Directive } from '@angular/core';
import { BaseAnimationDirective } from './base';
import { animate, style } from '@angular/animations';
@Directive({
    standalone: true,
    selector: '[animateFromTop]',
})
export class AnimateFromTopDirective extends BaseAnimationDirective {
    protected override initializeAnimation() {
        const factory = this.animationBuilder.build([
            style({ opacity: 0, transform: 'translateY(-50px)' }),
            animate(
                this.duration + ' ' + this.easing,
                style({ opacity: 1, transform: 'translateY(0)' })
            ),
        ]);
        this.player = factory.create(this.el.nativeElement);
    }
}
