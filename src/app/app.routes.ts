import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('../components/home/home.component').then(m => m.HomeComponent) },
    { path: 'start-exam', loadComponent: () => import('../components/start-exam/start-exam.component').then(m => m.StartExamComponent) },
    { path: 'end-exam', loadComponent: () => import('../components/end-exam/end-exam.component').then(m => m.EndExamComponent) }
];
