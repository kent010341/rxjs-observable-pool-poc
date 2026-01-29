import { Component, inject, input, OnInit, signal } from '@angular/core';
import { defer, delay, of, tap } from 'rxjs';
import { ObservablePool } from '../core/concurrency/observable-pool';

@Component({
    selector: 'app-submitter',
    imports: [],
    templateUrl: './submitter.html',
    styleUrl: './submitter.scss',
})
export class Submitter implements OnInit {

    private readonly poolService = inject(ObservablePool);

    readonly sleepTime = input.required<number>();

    readonly error = input<boolean>(false);

    protected readonly readyState = signal<'loading' | 'ready' | 'error'>('loading');

    private readonly somethingSlow$ = defer(() => of(null).pipe(
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
            },
            error: () => {
                this.readyState.set('error');
            }
        });
    }

}

export interface SubmitterConfig {

    readonly sleepTime: number;

    readonly error?: boolean;

}
