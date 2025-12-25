import { Injectable, inject } from "@angular/core";
import { CategoryDto, CategoryViewModel } from "@models";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";
import { ListResponse, createQueryParams } from "@core/search-model";

@Injectable()
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Category";

  // GetCategories(model: QueryParams) {
  //   return this.http.get<ListResponse<CategoryViewModelListPagedResponse>>(
  //     this.baseURL + "/GetCategorys" + createQueryParams(model),
  //   );
  // }

  Delete(id: number) {
    return this.http.delete<void>(this.baseURL + `/${id}`);
  }

  Create(data: CategoryDto) {
    return this.http.post<void>(this.baseURL, data);
  }

  Update(data: CategoryDto) {
    return this.http.put<void>(this.baseURL + "/" + data.id, data);
  }

  GetCategorysChildByShowCode(showCode?: string) {
    return this.http.get<ListResponse<CategoryViewModel[]>>(
      this.baseURL +
        "/GetCategorysChildByShowCode" +
        createQueryParams({ showCode }),
    );
  }
}
