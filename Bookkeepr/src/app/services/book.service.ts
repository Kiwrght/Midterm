import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './constants';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private booksUrl = `${API_URL}/books`;

  constructor(private http: HttpClient) {}

  addBook(bookData: any): Observable<any> {
    return this.http.post(this.booksUrl, bookData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });
  }

  getBook(id: string): Observable<any> {
    return this.http.get(`${this.booksUrl}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });
  }

  getBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/books`);
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.booksUrl}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });
  }


  editBook(id: string, bookData: any): Observable<any> {
    return this.http.put(`${this.booksUrl}/${id}`, bookData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });
  }
}