import { inject, Pipe, PipeTransform } from "@angular/core";
import { BASE_URL } from "./base-url-token";

@Pipe({
  name: "imageURLResolver",
})
export class ImageURLResolverPipe implements PipeTransform {
  private readonly baseURL = inject(BASE_URL);

  transform(value?: string): string {
    return `${this.baseURL}Document?DocumentId=${value}`;
  }
}
