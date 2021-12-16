import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(e => {
        if (e) {
          switch (e.status) {
            case 400:
              if (e.error.errors) {
                const modalStateErrors = [];
                for (const key in e.error.errors) {
                  if (e.error.errors[key]) {
                    modalStateErrors.push(e.error.errors[key]);
                  }
                }

                throw modalStateErrors.flat(); // es2019
              } else {
                this.toastr.error(e.statusText, e.status);
              }
              break;
            case 401:
              this.toastr.error(e.statusText, e.status);
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = { state: { error: e.error} };
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
            default:
              this.toastr.error('Something unexpected went wrong');
              console.log(e);
              break;
          }

          return throwError(e);
        }
      })
    )
  }
}
