import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BASE_URL } from '@core/base-url-token';
import { Observable } from 'rxjs';

export interface SecuredAction {
  actionName: string;
  actionDisplayName: string;
  httpMethods: string[];
}

export interface ControllerAction {
  controllerName: string;
  controllerDisplayName: string;
  apiActions: SecuredAction[];
}

export interface UserClaims {
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  claimValues: string[];
}

export interface SecuredActionsResponse {
  dynamicallySecuredActions: ControllerAction[];
  userClaims: UserClaims | null;
}

export interface DynamicClaimsDto {
  userId: number;
  claimType: string;
  inputClaimValues: string[];
}

export interface ClaimsResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DynamicPermissionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(BASE_URL) +'DynamicPermissionsManager';

  getDynamicallySecuredServerActions(userId: number): Observable<SecuredActionsResponse> {
    return this.http.get<SecuredActionsResponse>(`${this.apiUrl}/DynamicallySecuredServerActions/${userId}`);
  }

  addOrUpdateClaims(model: DynamicClaimsDto): Observable<ClaimsResponse> {
    return this.http.post<ClaimsResponse>(`${this.apiUrl}/AddOrUpdateClaims`, model);
  }
}