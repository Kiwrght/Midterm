import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: any[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  editBook(bookId: string): void {
    console.log(`Editing book with ID: ${bookId}`);
    
  }
  

  loadBooks(): void {
    this.bookService.getBooks().subscribe(fetchedBooks => {
      this.books = fetchedBooks; 
    });
  }

  deleteBook(bookId: string): void {
    this.bookService.deleteBook(bookId).subscribe(() => {
      this.books = this.books.filter(book => book._id !== bookId);
    });
  }
}