import { Observable } from "rxjs";
import { Injectable, inject } from "@angular/core";
import {
  SlideDto,
  SliderDto,
  SliderViewModel,
  SlideViewModel,
  SlideViewModelListPagedResponse,
} from "@models";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";
import {
  ListResponse,
  QueryParams,
  createQueryParams,
} from "@core/search-model";

@Injectable()
export class SliderService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Sliders";

  GetSlidersList(
    params: QueryParams,
  ): Observable<ListResponse<SliderViewModel[]>> {
    return this.http.get<ListResponse<SliderViewModel[]>>(
      this.baseURL + createQueryParams(params),
    );
  }

  GetSlidesList(
    sliderId: number,
    params: QueryParams,
  ): Observable<SlideViewModelListPagedResponse> {
    return this.http.get<SlideViewModelListPagedResponse>(
      this.baseURL + `/${sliderId}/slides` + createQueryParams(params),
    );
  }

  CreateSlider(data: SliderDto): Observable<void> {
    return this.http.post<void>(this.baseURL, data);
  }

  CreateSlide(sliderId: number, data: SlideDto): Observable<void> {
    return this.http.post<void>(this.baseURL + `/${sliderId}/slides`, data);
  }

  EditSlide(sliderId: number, data: SlideViewModel): Observable<void> {
    return this.http.post<void>(this.baseURL + `/${sliderId}/slides`, data);
  }

  DeleteSlide(sliderId: number, slideId: number): Observable<void> {
    return this.http.delete<void>(
      this.baseURL + `/${sliderId}/slides?id=${slideId}`,
    );
  }
}
