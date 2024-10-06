import { trigger, transition, style, animate } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
    transition(':enter', [
        style({ opacity: 0 }),

        animate('50ms ease-in-out', style({ opacity: 1 })),
    ]),

    transition(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
]);
