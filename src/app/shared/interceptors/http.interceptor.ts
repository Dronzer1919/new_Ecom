

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError, map, finalize } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);
  const toastrService = inject(ToastrService);
  const modifiedReq = req.clone({
    // setHeaders: {
    //   API_KEY: "test 1"
    // }
  });
  spinnerService.show();
  return next(modifiedReq).pipe(
    map((event: HttpEvent<any>) => {
      // debugger
      if (event instanceof HttpResponse) {
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 400:
          toastrService.error('Bad Request: The server did not understand the request.');
          break;
        case 401:
          toastrService.error('Unauthorized: You are not authorized to access this resource.');
          break;
        case 403:
          toastrService.error('Forbidden: Access to this resource is forbidden.');
          break;
        case 404:
          toastrService.error('Not Found: The requested resource was not found on the server.');
          break;
        case 500:
          toastrService.error('Internal Server Error: The server encountered an unexpected condition.');
          break;
        
        default:
          toastrService.error('An unexpected error occurred.');
          break;
      }
      return throwError(() => error);
    }),
    finalize(() => {
      spinnerService.hide();
    })
  );
};
