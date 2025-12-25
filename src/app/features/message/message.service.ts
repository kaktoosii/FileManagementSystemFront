import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { MessageDto, MessageViewModel } from "@models";
import { BASE_URL } from "@core/base-url-token";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(BASE_URL) + "Messages";

  constructor() {}

  getMessages(filter: {
    pageNumber: number;
    pageSize: number;
    searchText?: string;
  }): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`, { params: { ...filter } });
  }

  addMessage(message: MessageDto): Observable<MessageDto> {
    return this.http.post<MessageDto>(this.baseUrl, message);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
