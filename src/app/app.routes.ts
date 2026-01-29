import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./main/main').then(m => m.Main) },
];
