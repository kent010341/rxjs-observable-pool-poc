import { Component, inject, input, OnInit, signal } from '@angular/core';
import { defer, delay, of, tap } from 'rxjs';
import { ObservablePool } from '../core/concurrency/observable-pool';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-submitter',
    imports: [
        DatePipe,
    ],
    templateUrl: './submitter.html',
    styleUrl: './submitter.scss',
})
export class Submitter implements OnInit {

    private readonly poolService = inject(ObservablePool);

    readonly sleepTime = input.required<number>();

    readonly error = input<boolean>(false);

    protected readonly readyState = signal<'pending' | 'loading' | 'ready' | 'error'>('pending');

    protected readonly startTime = signal<number | undefined>(undefined);

    protected readonly endTime = signal<number | undefined>(undefined);

    private readonly somethingSlow$ = defer(() => of(null).pipe(
        tap(() => {
            this.readyState.set('loading');
            this.startTime.set(Date.now());
        }),
        // Simulate a slow operation
        delay(this.sleepTime()),
        tap(() => {
            if (this.error()) {
                throw new Error('Simulated error');
            }
        }),
    ));

    ngOnInit(): void {
        this.poolService.run(this.somethingSlow$).subscribe({
            next: () => {
                this.readyState.set('ready');
                this.endTime.set(Date.now());
            },
            error: () => {
                this.readyState.set('error');
                this.endTime.set(Date.now());
            }
        });
    }

}

export interface SubmitterConfig {

    readonly sleepTime: number;

    readonly error?: boolean;

}
