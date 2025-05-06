import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent {
  book = { title: '', author: '', genre: '', book_status: '', rating: 0 };
  editingBookId: string | null = null;

  constructor(private bookService: BookService) {}

  submitBook(): void {
    if (!localStorage.getItem("access_token")) {
      alert("You need to log in before adding a book.");
      return;
    }

    if (!this.book.title || !this.book.author || !this.book.genre || this.book.rating < 1 || this.book.rating > 5) {
      alert("Please enter valid book details.");
      return;
    }

    this.bookService.addBook(this.book).subscribe(() => {
      alert("Book added successfully!");
      this.resetForm();
    });
  }

  editBook(id: string): void {
    this.bookService.getBook(id).subscribe(book => {
      this.book = book;
      this.editingBookId = id;
    });
  }

  saveEditedBook(): void {
    if (!this.editingBookId) return;

    this.bookService.editBook(this.editingBookId, this.book).subscribe(() => {
      alert("Book updated successfully!");
      this.resetForm();
    });
  }

  resetForm(): void {
    this.book = { title: '', author: '', genre: '', book_status: '', rating: 0 };
    this.editingBookId = null;
  }
}