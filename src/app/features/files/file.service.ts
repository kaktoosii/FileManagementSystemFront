import { Observable } from "rxjs";
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";

export interface FileDto {
  id: number;
  path: string;
  fileName: string;
  originalFileName: string;
  userId: number;
  registerDate: string;
  mimeType: string;
  fileSize: number;
  folderId?: number;
  folderName?: string;
  filePatternId?: number;
  filePatternName?: string;
  patternValues?: string;
}

export interface UploadFileResponse {
  fileId: number;
  message: string;
}

@Injectable()
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "File";

  uploadFile(
    file: File,
    folderId?: number,
    filePatternId?: number,
    patternValues?: Record<string, string>
  ): Observable<UploadFileResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    if (folderId !== undefined && folderId !== null) {
      formData.append("folderId", folderId.toString());
    }
    
    if (filePatternId !== undefined && filePatternId !== null) {
      formData.append("filePatternId", filePatternId.toString());
    }
    
    if (patternValues) {
      formData.append("patternValuesJson", JSON.stringify(patternValues));
    }

    return this.http.post<UploadFileResponse>(`${this.baseURL}/upload`, formData);
  }

  getFileById(id: number): Observable<FileDto> {
    return this.http.get<FileDto>(`${this.baseURL}/${id}`);
  }

  getFilesByFolder(folderId: number): Observable<FileDto[]> {
    return this.http.get<FileDto[]>(`${this.baseURL}/folder/${folderId}`);
  }

  getFilesByUser(userId?: number): Observable<FileDto[]> {
    const url = userId ? `${this.baseURL}/user/${userId}` : `${this.baseURL}/user`;
    return this.http.get<FileDto[]>(url);
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseURL}/${id}/download`, {
      responseType: "blob",
    });
  }

  deleteFile(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/${id}`);
  }

  moveFile(id: number, newFolderId?: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.baseURL}/${id}/move`,
      newFolderId ?? null
    );
  }
}

