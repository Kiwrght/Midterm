from datetime import datetime
from typing import Annotated
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, requests, status, Path
from auth.jwt_auth import TokenData
from routers.user_router import get_user
from models.book_model import Book, BookRequest


# The Open Library API URL for fetching book details
OPEN_LIBRARY_URL = "https://openlibrary.org/api/books"

book_router = APIRouter()

books_list = []  # List to store books
max_id: int = 0  # Variable to store the maximum ID of the book


@book_router.post("/", response_model=Book)
async def create_book(book_data: BookRequest, user=Depends(get_user)):
    book = Book(**book_data.dict(), userId=user.username)  # Attach user ID
    await book.insert()
    return book


# Admin only route to get all books
@book_router.get("")
async def get_all_books(user: Annotated[TokenData, Depends(get_user)]) -> list[Book]:
    if not user or not user.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Please login.",
        )
    if not user.role != "AdminUser":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {user.username} does not have permission to access this resource.",
        )
    # Fetch all books from the database
    return await Book.find_all().to_list()


# ISBN -API
@book_router.get("/isbn/{isbn}")
async def get_book_by_isbn(isbn: str) -> Book:
    url = f"{OPEN_LIBRARY_URL}?bibkeys=ISBN:{isbn}&format=json&jscmd=data"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if f"ISBN:{isbn}" in data:
            return data[f"ISBN:{isbn}"]
        else:
            raise HTTPException(status_code=404, detail="Book not found")
    else:
        raise HTTPException(
            status_code=response.status_code,
            detail="Error fetching data from Open Library",
        )


@book_router.get("/my-books")
async def get_book_by_id(user: Annotated[TokenData, Depends(get_user)]) -> list[Book]:

    # Query the database for the book with the given ID
    books = await Book.find(Book.userId == user.username).to_list()
    if books:
        return books
    else:  # If the book is not found, raise a 404 error
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No Books found for your account",
        )


@book_router.put("/{book_id}")
async def update_book(
    book_id: int, book: BookRequest, user: Annotated[TokenData, Depends(get_user)]
) -> dict:
    book_to_update = await Book.get(book_id)
    if not book_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"The book with ID={book_id} is not found.",
        )
    if book_to_update.userId != user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {user.username} does not have permission to access this resource.",
        )

    book_to_update.title = book.title
    book_to_update.author = book.author
    book_to_update.genre = book.genre
    book_to_update.book_status = book.book_status
    book_to_update.rating = book.rating
    book_to_update.updatedAt = datetime.now()  # Update timestamp

    await book_to_update.save()

    return {
        "message": "Book updated successfully",
        "book": book_to_update.dict(by_alias=True),
    }


@book_router.delete("/{book_id}")
async def delete_book(
    book_id: PydanticObjectId, user: Annotated[TokenData, Depends(get_user)]
) -> dict:
    book_to_delete = await Book.get(book_id)
    if not book_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"The book with ID={book_id} is not found.",
        )
    if book_to_delete.userId != user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {user.username} does not have permission to access this resource.",
        )

    # Delete the book from the database
    await book_to_delete.delete()
    return {"message": f"Book with ID={book_id} was deleted successfully"}
