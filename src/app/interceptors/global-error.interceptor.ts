import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      // Ignore 401s as they are handled by auth interceptor/guard usually
      if (error.status === 401) {
          return throwError(() => error);
      }

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
         if (error.status === 400) {
            if (error.error && error.error.errors) {
                 const errors = Object.values(error.error.errors).flat();
                 errorMessage = errors.join('<br>');
            } else if (error.error && error.error.message) {
                 errorMessage = error.error.message;
            } else {
                 errorMessage = error.message || 'Bad Request';
            }
        } else if (error.status === 403) {
             errorMessage = 'You do not have permission to perform this action.';
        } else if (error.status === 404) {
             errorMessage = 'The requested resource was not found.';
        } else if (error.status === 500) {
            errorMessage = 'Internal Server Error. Please contact support.';
        } else {
             errorMessage = error.error?.message || error.message || errorMessage;
        }
      }

      // Show Modal
      alertService.error('Error', errorMessage);
      return throwError(() => error);
    })
  );
};
