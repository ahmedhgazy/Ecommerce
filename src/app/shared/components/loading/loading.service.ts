import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    concatMap,
    defer,
    finalize,
    Observable,
    of,
    tap,
} from 'rxjs';

@Injectable()
export class LoadingService {
    // create a subject to emit the value of loading !
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$: Observable<boolean> = this.loadingSubject.asObservable();
    constructor() {}



    //* Using defer to defer the execution of the observable until the subscription
    showLoadingUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
        return defer(() => {
            this.loadingOn(); // Runs synchronously on subscription
            return obs$.pipe(finalize(() => this.loadingOf()));
        });
    }

    loadingOn() {
        this.loadingSubject.next(true);
    }

    loadingOf() {
        this.loadingSubject.next(false);
    }
}
