from datetime import datetime
import os
from typing import Annotated
from beanie import PydanticObjectId
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    requests,
    status,
)
from auth.jwt_auth import TokenData
from routers.user_router import get_user
from models.book_model import Book, BookRequest
import xml.etree.ElementTree as ET
import re
import base64
import logging

logger = logging.getLogger(__name__)


# The Open Library API URL for fetching book details
OPEN_LIBRARY_URL = "https://openlibrary.org/api/books"

book_router = APIRouter()

books_list = []  # List to store books


# ** POSTING METHODS **#
# Route to add a new book
@book_router.post("/", response_model=Book, status_code=status.HTTP_201_CREATED)
async def create_book(book_data: BookRequest, user=Depends(get_user)):
    logger.info(f"{user.username} is trying to add a Book")
    print(f"Received book data: {book_data.dict()}")
    book_dict = book_data.dict()
    book_dict["cover_image"] = book_data.cover_image

    book = Book(**book_data.dict(), userId=user.username)  # Attach user ID
    print(
        f"Saving book with cover: {book.cover_image} and review: {book.review}"
    )  # Debugging

    logger.info(f"New Book Created: {book.title}")
    await book.insert()
    return book


# route to upload a cover image
@book_router.post("/upload")
async def upload_cover(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only image files are allowed.",
        )

    try:
        file_data = await file.read()
        base64_image = base64.b64encode(file_data).decode("utf-8")
        cover_image = f"data:image/jpeg;base64,{base64_image}"
        print(f"Returning Cover Image: {cover_image[:50]}...")
        return {"cover_image": cover_image}
    except Exception as e:
        print(f"Error uploading cover image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload cover image.",
        )


# ** GETTING METHODS **#
# Admin only route to get all books
@book_router.get("/all-books", response_model=list[Book])
async def get_all_books(user: Annotated[TokenData, Depends(get_user)]) -> list[Book]:
    if not user or not user.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Please login.",
        )
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {user.username} does not have permission to access this resource.",
        )
    # Fetch all books from the database
    return await Book.find_all().to_list()


@book_router.get("/books/search")
async def search_books(query: str) -> dict:

    is_isbn = re.fullmatch(r"[\d-]{10,13}", query)  # Detects 10 or 13-digit ISBNs

    # If the query is an ISBN, fetch book details using the Open Library API
    if is_isbn:
        url = f"{OPEN_LIBRARY_URL}?bibkeys=ISBN:{query}&format=json&jscmd=data"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return data.get(f"ISBN:{query}", {"detail": "Book not found"})
        else:
            raise HTTPException(
                status_code=response.status_code, detail="Error fetching ISBN data"
            )

    # If the query is not an ISBN, search for books using the Open Library API
    else:
        url = f"https://openlibrary.org/search.json?q={query}"
        response = requests.get(url)
        print(f"Response from Open Library: {response.status_code}")
        if response.status_code == 200:
            return response.json()["docs"]
        else:
            raise HTTPException(
                status_code=500, detail="Error fetching books from Open Library"
            )


@book_router.get("/my-books")
async def get_all_user_books(
    user: Annotated[TokenData, Depends(get_user)],
) -> list[Book]:

    # Query the database for the book with the given ID
    books = await Book.find(Book.userId == user.username).to_list()
    if books:
        return books
    else:  # If the book is not found, raise a 404 error
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No Books found for your account",
        )


@book_router.get("/{book_id}", response_model=Book)
async def get_book_by_id(
    book_id: PydanticObjectId, user: Annotated[TokenData, Depends(get_user)]
) -> dict:
    print(f"Received request for book ID: {book_id}")
    book = await Book.find_one(Book.id == book_id, Book.userId == user.username)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID={book_id} not found or doesn't belong to the user.",
        )

    print(f"Retrieved Book: {book.dict(by_alias=True)}")  # Debugging
    return book.dict(by_alias=True)


# *** PUTTING METHODS **#
@book_router.put("/{book_id}", response_model=Book)
async def update_book(
    book_id: PydanticObjectId,
    updated_data: BookRequest,  # Validate against the BookRequest model
    user: Annotated[TokenData, Depends(get_user)],
) -> dict:
    print(f"Received update request for book ID: {book_id}")
    print(f"Received JSON Body: {updated_data.dict()}")  # Debugging

    # Find book in MongoDB
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

    print(
        f"Before Update - Title: {book_to_update.title}, Status: {book_to_update.book_status}"
    )

    # Update book fields
    update_data = updated_data.dict(exclude_unset=True)  # Only update provided fields
    print(f"Updating book with data: {update_data}")  # Debugging
    update_result = await book_to_update.update({"$set": update_data})
    print(f"Update Result: {update_result}")  # Debugging MongoDB response

    updated_book = await Book.get(book_id)
    print(
        f"After Update - Title: {updated_book.title}, Status: {updated_book.book_status}"
    )

    return updated_book.dict(by_alias=True)


# ** DELETING METHODS **#
@book_router.delete("/{book_id}")
async def delete_book(
    book_id: PydanticObjectId, user: Annotated[TokenData, Depends(get_user)]
) -> dict:
    logger.info(f"{user.username} is trying to delete a Book")
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
    logger.info(f"Book with ID={book_id} deleted successfully")
    return {"message": f"Book with ID={book_id} was deleted successfully"}
