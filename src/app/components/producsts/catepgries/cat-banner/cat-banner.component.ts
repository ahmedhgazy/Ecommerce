import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-cat-banner',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './cat-banner.component.html',
    styleUrl: './cat-banner.component.scss',
})
export class CatBannerComponent implements OnInit, OnDestroy {
    targetDate = signal(this.calculateTargetDate(5));
    currentTime = signal(new Date());
    private animationFrameId: number | undefined;

    countdown = computed(() => {
        const timeDifference =
            this.targetDate().getTime() - this.currentTime().getTime();

        if (timeDifference > 0) {
            return {
                days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor(
                    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                ),
                minutes: Math.floor(
                    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
                ),
                seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
            };
        } else {
            this.resetCountdown();
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    });

    ngOnInit() {
        this.updateTime(); // Start the update loop
    }

    ngOnDestroy() {
        if (this.animationFrameId !== undefined) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    private calculateTargetDate(daysToAdd: number): Date {
        const now = new Date();
        return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    private resetCountdown() {
        this.targetDate.set(this.calculateTargetDate(5));
    }

    private updateTime() {
        this.currentTime.set(new Date());
        this.animationFrameId = requestAnimationFrame(() => this.updateTime());
    }

    /*

    *  Does not work properly (stuck in an infinite loop)
        countdown$: Observable<CountdownTime>;
    private countdownSubscription: Subscription | null = null;

    constructor(private countdownService: CountdownService) {
        console.log('CatBannerComponent constructed');
    }

    ngOnInit() {
    this.countdown$ = this.countdownService.countdown$;
    const endDate = new Date(
        new Date().getTime() +
            5 * 24 * 60 * 60 * 1000 +
            5 * 60 * 60 * 1000 +
            35 * 60 * 1000 +
            30 * 1000
    );
    console.log('Setting countdown end date to:', endDate);
    this.countdownService.startCountdown(endDate);
    this.countdownSubscription = this.countdown$.subscribe(
        (countdown) =>
            console.log('Countdown update in component:', countdown),
        (error) => console.error('Error in countdown subscription:', error)
    );
    }

    ngOnDestroy() {
    console.log('CatBannerComponent being destroyed');
    if (this.countdownSubscription) {
        this.countdownSubscription.unsubscribe();
    }
    }
    */
}
