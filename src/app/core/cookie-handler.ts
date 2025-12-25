export const TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";
export const ACCESS_TOKEN = "dynamicPermissionsToken";
export class CookieHandler {
  static setToken(token: string) {
    this.setCookie(TOKEN, token, 1);
  }

  static getToken(): string {
    return this.getCookie(TOKEN);
  }

  static removeToken() {
    this.eraseCookie(TOKEN);
  }

  static setAccess(token: string) {
    this.setCookie(ACCESS_TOKEN, token, 1);
  }

  static getAccess(): string {
    return this.getCookie(ACCESS_TOKEN);
  }

  static removeAccess() {
    this.eraseCookie(ACCESS_TOKEN);
  }

  static setRefreshToken(token: string) {
    this.setCookie(REFRESH_TOKEN, token, 1);
  }

  static getRefrshToken(): string {
    return this.getCookie(REFRESH_TOKEN);
  }

  static removeRefreshToken() {
    this.eraseCookie(REFRESH_TOKEN);
  }

  private static setCookie(name: string, value: string, days = 1) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  private static getCookie(name: string): string {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
  }

  private static eraseCookie(name: string): void {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}
