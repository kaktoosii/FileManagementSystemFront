import { Observable } from "rxjs";
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";

export enum FieldType {
  Text = 'Text',
  Number = 'Number',
  Date = 'Date',
  Select = 'Select',
  TextArea = 'TextArea',
}

export interface PatternFieldDto {
  id: number;
  fieldName: string;
  placeholder: string;
  fieldType: FieldType;
  options?: string;
  isRequired: boolean;
  defaultValue?: string;
  order: number;
}

export interface FilePatternDto {
  id: number;
  name: string;
  description?: string;
  pattern: string;
  userId: number;
  createDate: string;
  fields: PatternFieldDto[];
}

export interface CreatePatternFieldDto {
  fieldName: string;
  placeholder: string;
  fieldType: FieldType;
  options?: string;
  isRequired: boolean;
  defaultValue?: string;
  order: number;
}

export interface CreateFilePatternDto {
  name: string;
  description?: string;
  pattern: string;
  fields: CreatePatternFieldDto[];
}

export interface UpdateFilePatternDto {
  name: string;
  description?: string;
  pattern: string;
  fields: CreatePatternFieldDto[];
}

@Injectable()
export class FilePatternService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "FilePattern";

  createPattern(pattern: CreateFilePatternDto): Observable<{ message: string; patternId: number }> {
    return this.http.post<{ message: string; patternId: number }>(this.baseURL, pattern);
  }

  getPatternById(id: number): Observable<FilePatternDto> {
    return this.http.get<FilePatternDto>(`${this.baseURL}/${id}`);
  }

  getPatternsByUser(userId?: number): Observable<FilePatternDto[]> {
    const url = userId ? `${this.baseURL}/user/${userId}` : `${this.baseURL}/user`;
    return this.http.get<FilePatternDto[]>(url);
  }

  updatePattern(id: number, pattern: UpdateFilePatternDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseURL}/${id}`, pattern);
  }

  deletePattern(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/${id}`);
  }

  generateFileName(id: number, fieldValues: Record<string, string>): Observable<{ fileName: string }> {
    return this.http.post<{ fileName: string }>(`${this.baseURL}/${id}/generate`, fieldValues);
  }
}

