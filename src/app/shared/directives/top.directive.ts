import {
  Directive,
  HostListener,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';

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

  ) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    this.renderer.setStyle(this.element, 'display', 'none');

    this.scrollSubscription = fromEvent(window, 'scroll')
      .pipe(
        throttleTime(100), // Limit scroll event firing
        debounceTime(100) // Wait for scroll to finish
      )
      .subscribe(() => this.toggleVisibility());
  }

  ngOnDestroy() {
    this.scrollSubscription.unsubscribe();
  }

  @HostListener('click')
  onClick() {
    if (this.smoothScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }

  private toggleVisibility() {
    if (window.pageYOffset > this.scrollThreshold) {
      this.renderer.setStyle(this.element, 'display', 'flex');
    } else {
      this.renderer.setStyle(this.element, 'display', 'none');
    }
  }
}
