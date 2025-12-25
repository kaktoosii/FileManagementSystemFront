export interface ListResponse<T = any> {
  data: T;
  succeeded: boolean;
  developerMessages: string;
  message: string;
}

export interface QueryParams {
  PageNumber?: number;
  PageSize?: number;
  SearchText?: string;
}

export function createQueryParams(params: any): string {
  const result: string[] = [];

  for (const iterator in params) {
    if (params[iterator]) {
      result.push(`${iterator}=${params[iterator]}`);
    }
  }

  return result.length > 0 ? "?" + result.join("&") : "";
}
