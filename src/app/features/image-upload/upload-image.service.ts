import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_URL } from "@core/base-url-token";
import { Observable } from "rxjs";
@Injectable()
export class UploadImageService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL);

  uploadImage(image: File): Observable<string> {
    const formData = new FormData();
    formData.append("document", image);

    return this.http.post<string>(`${this.baseURL}Document`, formData);
  }
}
