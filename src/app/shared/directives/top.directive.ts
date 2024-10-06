import {
    Directive,
    HostListener,
    Input,
    ElementRef,
    Renderer2,
    OnInit,
    OnDestroy,
    PLATFORM_ID,
    Inject,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Directive({
    selector: '[appBackToTop]',
    standalone: true,
})
export class BackToTopDirective implements OnInit, OnDestroy {
    @Input() scrollThreshold = 400; // Pixels from top to show button
    @Input() smoothScroll = true;

    private element: HTMLElement;
    private scrollSubscription: Subscription;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,

        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.element = el.nativeElement;
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.setStyle(this.element, 'display', 'none');

            this.scrollSubscription = fromEvent(window, 'scroll')
                .pipe(
                    throttleTime(100), // Limit scroll event firing
                    debounceTime(100) // Wait for scroll to finish
                )
                .subscribe(() => this.toggleVisibility());
        }
    }

    ngOnDestroy() {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe();
        }
    }

    @HostListener('click')
    onClick() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.smoothScroll) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0);
            }
        }
    }

    private toggleVisibility() {
        if (isPlatformBrowser(this.platformId)) {
            if (window.pageYOffset > this.scrollThreshold) {
                this.renderer.setStyle(this.element, 'display', 'flex');
            } else {
                this.renderer.setStyle(this.element, 'display', 'none');
            }
        }
    }
}
