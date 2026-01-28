import { Directive, ElementRef, OnInit, OnDestroy, Input, Renderer2, AfterViewInit } from '@angular/core';
import { AnimationBuilder, AnimationPlayer } from '@angular/animations';

@Directive()
export abstract class BaseAnimationDirective implements AfterViewInit, OnDestroy {
    @Input() delay: number = 0;
    @Input() duration: string = '800ms';
    @Input() easing: string = 'cubic-bezier(0.25, 0.8, 0.25, 1)'; // Smooth easing default

    protected player: AnimationPlayer | undefined;
    private observer: IntersectionObserver | undefined;

    constructor(
        protected el: ElementRef,
        protected animationBuilder: AnimationBuilder,
        protected renderer: Renderer2
    ) {}

    ngAfterViewInit() {
        this.initializeAnimation();
        this.setupObserver();
    }

    ngOnDestroy() {
        if (this.player) {
            this.player.destroy();
        }
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    protected abstract initializeAnimation(): void;

    private setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.playAnimation();
                    this.observer?.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // Slight offset so it triggers a bit before fully scrolling in
        });

        this.observer.observe(this.el.nativeElement);
    }

    protected playAnimation() {
        if (this.player) {
            // Apply delay if specified
            if (this.delay > 0) {
                setTimeout(() => {
                    this.player?.play();
                }, this.delay);
            } else {
                this.player.play();
            }
        }
    }
}
