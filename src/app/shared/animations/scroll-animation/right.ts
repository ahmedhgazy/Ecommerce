import { Directive } from '@angular/core';
import { BaseAnimationDirective } from './base';
import { animate, style } from '@angular/animations';
@Directive({
    standalone: true,
    selector: '[animateFromRight]',
})
export class AnimateFromRightDirective extends BaseAnimationDirective {
    protected override createAnimation() {
        const factory = this.animationBuilder.build([
            style({ opacity: 0, transform: 'translateX(100px)' }),
            animate(
                '800ms ease-out',
                style({ opacity: 1, transform: 'translateX(0)' })
            ),
        ]);
        this.player = factory.create(this.el.nativeElement);
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
        this.playAnimation();
    }
}
