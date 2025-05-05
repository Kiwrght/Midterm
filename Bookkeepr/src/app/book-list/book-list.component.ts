import { Component, OnInit } from '@angular/core';
import { BookService } from '../book.service'; // ✅ Import the service

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: any[] = []; // ✅ Stores fetched books

  constructor(private bookService: BookService) {} // ✅ Inject the service

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.books = data; // ✅ Set books from API response
      console.log('Fetched books:', this.books); // ✅ Debugging
    });
  }
}