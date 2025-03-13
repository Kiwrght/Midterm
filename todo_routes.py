from fastapi import APIRouter, HTTPException, status, Path
from todo import Book, BookRequest

max_id: int = 0  # Variable to store the maximum ID of the book
todo_router = APIRouter()

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


# Update Book by ID
@todo_router.put("/{book_id}")
async def update_book(book_id: int, book: BookRequest):
    for book_in_list in books_list:
        if book_in_list.id == book_id:
            book_in_list.title = book.title
            book_in_list.author = book.author
            book_in_list.genre = book.genre
            book_in_list.book_status = book.book_status
            book_in_list.rating = book.rating
            return book_in_list  # Return updated book
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
@todo_router.delete("/{book_id}")
async def delete_book(book_id: int):
    for i in range(len(books_list)):
        if books_list[i].id == book_id:
            books_list.pop(i)
            return {"message": f"The Book with ID={book_id} is removed."}

    # Move the raise outside the loop
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Book with ID = {book_id} was not found",
    )
