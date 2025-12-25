import { Observable } from "rxjs";
import { Injectable, inject } from "@angular/core";
import { RegisterUserDto, UserViewModel, UserViewModelListPagedResponse } from "@models";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";
import { QueryParams, createQueryParams } from "@core/search-model";

export interface Response<T> {
  data: T;
  succeeded: boolean;
}

@Injectable()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Users";

  GetList(params: QueryParams): Observable<UserViewModelListPagedResponse> {
    return this.http.get<UserViewModelListPagedResponse>(
      this.baseURL + createQueryParams(params),
    );
  }

  registerUser(user: RegisterUserDto): Observable<Response<number>> {
    return this.http.post<Response<number>>(this.baseURL, user);
  }

  getUserById(userId: string): Observable<Response<UserViewModel>> {
    return this.http.get<Response<UserViewModel>>(`${this.baseURL}/${userId}`);
  }

  updateUser(userId: string, user: RegisterUserDto): Observable<Response<number>> {
    return this.http.put<Response<number>>(`${this.baseURL}/${userId}`, user);
  }

  deleteUser(userId: number): Observable<Response<void>> {
    return this.http.delete<Response<void>>(`${this.baseURL}/${userId}`);
  }
}
