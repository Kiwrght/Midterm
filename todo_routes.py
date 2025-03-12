from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Path
from todo import Book, BookRequest


todo_router = APIRouter(prefix="/books")

books_list = []  # List to store books


# Get all Books
@todo_router.get("")
async def get_books() -> list[Book]:
    return books_list


# Add a Book to the list
@todo_router.post("", status_code=status.HTTP_201_CREATED)
def add_book(book: BookRequest) -> Book:
    global max_id
    max_id += 1  # Increment the ID by 1
    newBook = Book(
        id=max_id,
        title=book.title,
        author=book.author,
        genre=book.genre,
        book_status=book.book_status,
        rating=book.rating,
    )
    books_list.append(newBook)
    return newBook


# Update Status of a Book
@todo_router.put("/{book_id}/status")
async def update_book(book_id: int, book_status: str):
    for book in books_list:
        if book.id == book_id:
            book.book_status = book_status
            return {"message": "Book status updated successfully", "book": book}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Book with ID = {book_id} was not found",
    )


# Adding a rating to a book
@todo_router.put("/{book_id}/rating")
async def update_rating(book_id: int, rating: int):
    for book in books_list:
        if book.id == book_id:
            book.rating = rating
            return {"message": "Book rating updated successfully", "book": book}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Book with ID = {book_id} was not found",
    )


# Delete a Book from the Library
@todo_router.delete("/books/{book_id}")
async def delete_book(book_id: int):
    for book in books_list:
        if book.id == book_id:
            books_list.remove(book)
            return {"message": "Book deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Book with ID = {book_id} was not found",
    )
