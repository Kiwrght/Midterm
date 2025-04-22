from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Path
from auth.jwt_auth import TokenData
from routers.user_router import get_user
from models.book_model import Book, BookRequest

book_router = APIRouter()

books_list = []  # List to store books
max_id: int = 0  # Variable to store the maximum ID of the book


@book_router.post("", status_code=status.HTTP_201_CREATED)
async def add_book(book: BookRequest) -> Book:
    global max_id
    max_id += 1
    new_book = Book(
        id=max_id,
        title=book.title,
        author=book.author,
        genre=book.genre,
        book_status=book.book_status,
        rating=book.rating,
        isbn=None,
    )
    await Book.insert_one(new_book)  # Save the book to the database
    return new_book


# Admin only route to get all books
@book_router.get("")
async def get_all_books(user: Annotated[TokenData, Depends(get_user)]) -> list[Book]:
    if not user or not user.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Please login.",
        )
    if not user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {user.username} does not have permission to access this resource.",
        )
    # Fetch all books from the database
    return await Book.find_all().to_list()


@book_router.get("/{book_id}")
async def get_book_by_id(book_id: int = Path(..., title="default")) -> Book:
    book = Book.get(book_id)
    if book:
        return book
    else:  # If the book is not found, raise a 404 error
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID = {book_id} was not found",
        )


@book_router.put("/{book_id}")
async def update_book(book_id: int, book: BookRequest) -> dict:
    for x in books_list:
        if x.id == book_id:
            x.title = book.title
            x.author = book.author
            x.genre = book.genre
            x.book_status = book.book_status
            x.rating = book.rating
            return {"message": "Book updated successfully"}

    return {"message": f"The todo with ID={book_id} is not found."}


@book_router.delete("/{book_id}")
async def delete_book(book_id: int) -> dict:
    for x in range(len(books_list)):
        book = books_list[x]
        if book.id == book_id:
            books_list.pop(x)
            return {"message": f"Book with ID={book_id} has deleted successfully"}

    return {"message": f"The todo with ID={book_id} is not found."}
