import {
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router,
} from "@angular/router";
import { CookieHandler } from "./cookie-handler";
import { inject } from "@angular/core";

export const AuthGuard: CanActivateFn = (): MaybeAsync<GuardResult> => {
  if (CookieHandler.getToken()) {
    return true;
  }

  inject(Router).navigate(["/login"]);

  return false;
};
