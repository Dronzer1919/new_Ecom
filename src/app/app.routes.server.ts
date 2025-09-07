import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  // Ensure parameterized product routes are rendered on server (not prerendered)
  {
    path: 'product/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'products/:category',
    renderMode: RenderMode.Server
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
