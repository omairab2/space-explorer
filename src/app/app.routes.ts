import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'detail/:date',
    loadComponent: () =>
      import('./presentation/pages/detail/detail.component').then((m) => m.DetailComponent),
  },
];
