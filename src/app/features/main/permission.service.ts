import { Injectable } from '@angular/core';
import { CookieHandler } from '@core/cookie-handler';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private claimValues: string[] = [];
  private roles: string[] = [];

  constructor() {
    this.loadPermissions();
  }

  private loadPermissions(): void {
    const access = CookieHandler.getAccess();
    const token = CookieHandler.getToken();

    if (access && token) {
      try {
        const payloadAccess = JSON.parse(this.base64UrlDecode(access.split('.')[1]));
        const payload = JSON.parse(this.base64UrlDecode(token.split('.')[1]));

        // Parse ::DynamicClientPermission::
        const permissions = payloadAccess['::DynamicClientPermission::'];
        if (permissions) {
          const parsedAccess = JSON.parse(permissions);
          this.claimValues = parsedAccess.ClaimValues || [];
        } else {
          this.claimValues = [];
        }

        // Parse roles
        const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        this.roles = payload[roleClaim]
          ? Array.isArray(payload[roleClaim])
            ? payload[roleClaim]
            : [payload[roleClaim]]
          : [];

        console.log('Parsed Roles:', this.roles);
        console.log('Parsed ClaimValues:', this.claimValues);
      } catch (error) {
        console.error('Error decoding JWT permissions:', error, { access, token });
        this.claimValues = [];
        this.roles = [];
      }
    } else {
      console.warn('Missing tokens:', { access, token });
      this.claimValues = [];
      this.roles = [];
    }
  }

  hasPermission(permission: string): boolean {
    return this.isAdmin() || this.claimValues.includes(permission);
  }

  isAdmin(): boolean {
    return this.roles.includes('Admin');
  }

  getClaimValues(): string[] {
    return [...this.claimValues];
  }

  getRoles(): string[] {
    return [...this.roles];
  }

  private base64UrlDecode(str: string): string {
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const pad = str.length % 4;
    if (pad) {
      str += '='.repeat(4 - pad);
    }

    return atob(str);
  }
}
