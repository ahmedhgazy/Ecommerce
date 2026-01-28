import { Directive } from '@angular/core';
import { BaseAnimationDirective } from './base';
import { animate, style } from '@angular/animations';

@Directive({
    standalone: true,

    selector: '[animateFromLeft]',
})
export class AnimateFromLeftDirective extends BaseAnimationDirective {
    protected override initializeAnimation() {
        const factory = this.animationBuilder.build([
            style({ opacity: 0, transform: 'translateX(-100px)' }),
            animate(
                this.duration + ' ' + this.easing,
                style({ opacity: 1, transform: 'translateX(0)' })
            ),
        ]);
        this.player = factory.create(this.el.nativeElement);
    }
}
