from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Path
from todo import Book


todo_router = APIRouter(prefix="/books")

books = []  # List to store books


# Get all Books
@todo_router.get("/")
async def get_books() -> dict:
    return {"books": books}


# Add a Book to the list
@todo_router.post("/", status_code=status.HTTP_201_CREATED)
def add_book(book: Book) -> Book:
    books.append(book)
    return {"message": "Book added successfully", "book": book}


# Update Status and Rating of a Book
@todo_router.put("/{book_id}")
async def update_book(book_id: int, book_status: str, rating: int):
    for book in books:
        if book.id == book_id:
            book.book_status = book_status
            book.rating = rating
            return {
                "message": "Book status and rating updated successfully",
                "book": book,
            }
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Book with ID = {book_id} was not found",
    )


# Adding a rating to a book
@todo_router.put("/{book_id}/rating")
async def update_rating(book_id: int, rating: int):
    for book in books:
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
    for book in books:
        if book.id == book_id:
            books.remove(book)
            return {"message": "Book deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Book with ID = {book_id} was not found",
    )
