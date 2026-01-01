import { Observable } from "rxjs";
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";

export interface FolderDto {
  id: number;
  name: string;
  description?: string;
  parentFolderId?: number;
  parentFolderName?: string;
  userId: number;
  createDate: string;
  subFolders?: FolderDto[];
  documentCount: number;
}

export interface CreateFolderDto {
  name: string;
  description?: string;
  parentFolderId?: number;
}

export interface UpdateFolderDto {
  name: string;
  description?: string;
  parentFolderId?: number;
}

@Injectable()
export class FolderService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Folder";

  createFolder(folder: CreateFolderDto): Observable<{ message: string; folderId: number }> {
    return this.http.post<{ message: string; folderId: number }>(this.baseURL, folder);
  }

  getFolderById(id: number): Observable<FolderDto> {
    return this.http.get<FolderDto>(`${this.baseURL}/${id}`);
  }

  getFoldersByUser(userId?: number): Observable<FolderDto[]> {
    const url = userId ? `${this.baseURL}/user/${userId}` : `${this.baseURL}/user`;
    return this.http.get<FolderDto[]>(url);
  }

  getRootFolders(): Observable<FolderDto[]> {
    return this.http.get<FolderDto[]>(`${this.baseURL}/root`);
  }

  getSubFolders(parentId: number): Observable<FolderDto[]> {
    return this.http.get<FolderDto[]>(`${this.baseURL}/parent/${parentId}/children`);
  }

  updateFolder(id: number, folder: UpdateFolderDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseURL}/${id}`, folder);
  }

  deleteFolder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/${id}`);
  }

  moveFolder(id: number, newParentFolderId?: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.baseURL}/${id}/move`,
      newParentFolderId ?? null
    );
  }

  getFolderPath(id: number): Observable<{ path: string }> {
    return this.http.get<{ path: string }>(`${this.baseURL}/${id}/path`);
  }
}

