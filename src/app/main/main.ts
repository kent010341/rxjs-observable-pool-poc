import { Component } from '@angular/core';
import { Submitter, SubmitterConfig } from '../submitter/submitter';
import { OBSERVABLE_POOL_CONFIG, ObservablePool } from '../core/concurrency/observable-pool';

@Component({
    selector: 'app-main',
    imports: [
        Submitter,
    ],
    templateUrl: './main.html',
    styleUrl: './main.scss',
    providers: [
        {
            provide: OBSERVABLE_POOL_CONFIG,
            useValue: { poolSize: 2 },
        },
        ObservablePool,
    ]
})
export class Main {

    /** submitters, the number is greater than pool size, and some cause errors */
    readonly submitters: SubmitterConfig[] = [
        { sleepTime: 500 },
        { sleepTime: 1000, error: true },
        { sleepTime: 1000 },
        { sleepTime: 500 },
        { sleepTime: 300 },
        { sleepTime: 300 },
    ];

}
