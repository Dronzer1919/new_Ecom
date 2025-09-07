import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, Injectable } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Defensive DimensionsHelper for ngx-datatable: some environments pass a non-DOM element
// which causes `getBoundingClientRect is not a function`. We provide a safe implementation
// that attempts to use the DOM rect when available, or falls back to measured offsets.
import { DimensionsHelper as NgxDimensionsHelper } from '@swimlane/ngx-datatable';

@Injectable()
class SafeDimensionsHelper extends NgxDimensionsHelper {
  private static _logged = false;
  override getDimensions(element: any) {
    try {
      if (!element) return { width: 0, height: 0 } as DOMRect;

      // Unwrap common wrappers
      let el = element;
      // ElementRef-like
      if (el.nativeElement) el = el.nativeElement;
      // DebugElement has .nativeElement
      if (el.element && el.element.nativeElement) el = el.element.nativeElement;
      // Some directives may pass arrays or NodeLists
      if (Array.isArray(el) && el.length) el = el[0];
      if (el instanceof NodeList || el instanceof HTMLCollection) el = el[0];

      if (el && typeof el.getBoundingClientRect === 'function') {
        return el.getBoundingClientRect();
      }

      // Try offset/client measurements
      const width = (el && (el.offsetWidth || el.clientWidth)) || 0;
      const height = (el && (el.offsetHeight || el.clientHeight)) || 0;

      // Log the first problematic element shape to help diagnosis in case of future issues
      if (!SafeDimensionsHelper._logged && el && typeof el !== 'undefined') {
        SafeDimensionsHelper._logged = true;
        try {
          // eslint-disable-next-line no-console
          console.debug('SafeDimensionsHelper caught non-DOM element, shape:', el);
        } catch (e) {}
      }

      return {
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        x: 0,
        y: 0,
        toJSON() { return {} }
      } as DOMRect;
    } catch (e) {
      return { width: 0, height: 0 } as DOMRect;
    }
  }
}
import { httpInterceptor } from './shared/interceptors/http.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay(),
  ),
  // provideHttpClient(withFetch()),
    provideHttpClient(
      withInterceptors([httpInterceptor]),
    ),
  importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates:true
      })
    ),
    ToastrService,
  // Replace ngx-datatable DimensionsHelper with a safe implementation
  { provide: NgxDimensionsHelper, useClass: SafeDimensionsHelper }
  ]
};
