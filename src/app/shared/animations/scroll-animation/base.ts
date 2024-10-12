import { Directive, ElementRef, OnInit, Input, Renderer2 } from '@angular/core';
import { AnimationBuilder, AnimationPlayer } from '@angular/animations';

@Directive()
export class BaseAnimationDirective implements OnInit {
    @Input() delay: number = 0;
    protected player: AnimationPlayer;

    constructor(
        protected el: ElementRef,
        protected animationBuilder: AnimationBuilder,
        protected renderer: Renderer2
    ) {}

    ngOnInit() {
        this.createAnimation();
    }

    protected createAnimation() {}

    protected playAnimation() {
        setTimeout(() => this.player.play(), this.delay);
    }
}
