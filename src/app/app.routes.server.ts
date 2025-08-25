import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'productCategory/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'productDetails/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'addToCart/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
