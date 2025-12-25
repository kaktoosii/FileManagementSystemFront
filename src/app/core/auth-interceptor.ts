import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { EMPTY, Observable, throwError } from "rxjs";
import { catchError, timeout, map } from "rxjs/operators";
import {
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpHandlerFn,
} from "@angular/common/http";
import { CookieHandler } from "./cookie-handler";
import { AlertService } from "./alert.service";

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const alert = inject(AlertService);
  const router = inject(Router);

  if (!window.navigator.onLine) {
    alert.warning("متاسفیم به نظر میرسد اتصال اینترنت شما برقرار نمی باشد!");
    return EMPTY;
  }
  let token = CookieHandler.getToken();
  if (token == null || token == undefined) token = "";
  let tokenizedRequest: HttpRequest<any> = req;
  tokenizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  // if (!req.url.includes("Document") && !req.url.includes("importPatient")) {
  //   tokenizedRequest = req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //   });
  // }
  if (!(req.body instanceof FormData)) {
    req = req.clone({
      setHeaders: { 'Content-Type': 'application/json' }
    });
  }
  // if (!request.url.includes('.svg')) this.loadingSrv.show();
  return next(tokenizedRequest).pipe(
    map((d) => {
      if (d.type == 0) return d;
      // if (!request.url.includes('.svg')) this.loadingSrv.hide();
      return d;
    }),
    timeout(600000),
    catchError((error: HttpErrorResponse) => {
      // if (!request.url.includes('.svg')) this.loadingSrv.hide();
      switch (error.status) {
        case 404:
          alert.warning("متاسفیم نمیتونیم سرویس رو پیدا کنیم!");
          return throwError(() => error);
        case 401:
          if (CookieHandler.getToken()) {
            CookieHandler.removeToken();
          }
          alert.warning("مجوز دسترسی شما منقضی شده است");
          router.navigate(["/login"]);
          return throwError(() => error);
        case 403:
          alert.warning("شما دسترسی کافی ندارید!");
          return throwError(() => error);
        default:
          alert.error(error.error.message);
          return throwError(() => error);
      }
    }),
  );
};
