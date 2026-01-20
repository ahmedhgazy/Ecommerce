import { Component, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TimerDigitComponent } from './timer-digit/timer-digit.component';
import { PromotionsService } from '../../../../services/promotions/promotions.service';

@Component({
    selector: 'app-cat-banner',
    standalone: true,
    imports: [CommonModule, TranslateModule, TimerDigitComponent],
    templateUrl: './cat-banner.component.html',
    styleUrl: './cat-banner.component.scss',
})
export class CatBannerComponent implements OnInit, OnDestroy {
    promotionsService = inject(PromotionsService);
    
    // Initialize with a default value (e.g. now) to avoid errors before API returns
    // or keep the calculation as a temporary placeholder? 
    // Let's use current time + 1 day as a placeholder until API loads to prevent "00:00:00" if strict.
    // Or just start with what we had (static) as fallback.
    targetDate = signal(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)); 
    
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
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    });

    ngOnInit() {
        this.fetchFlashSaleDate();
        this.updateTime();
    }

    ngOnDestroy() {
        if (this.animationFrameId !== undefined) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    private fetchFlashSaleDate() {
        this.promotionsService.getFlashSaleEndDate().subscribe({
            next: (date) => {
                this.targetDate.set(date);
            },
            error: (err) => {
                console.error('Failed to fetch flash sale date', err);
                // Fallback to 1 day 5 hours 9 mins if API fails
                this.targetDate.set(this.calculateFallbackDate(1, 5, 9));
            }
        });
    }

    private calculateFallbackDate(days: number, hours: number = 0, minutes: number = 0): Date {
        const now = new Date();
        return new Date(
            now.getTime() +
            days * 24 * 60 * 60 * 1000 +
            hours * 60 * 60 * 1000 +
            minutes * 60 * 1000
        );
    }

    private updateTime() {
        this.currentTime.set(new Date());
        this.animationFrameId = requestAnimationFrame(() => this.updateTime());
    }
}
