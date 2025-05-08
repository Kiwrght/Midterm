from enum import Enum
from typing import Optional
from beanie import Document
from pydantic import BaseModel
from datetime import datetime



class BookStatus(str, Enum):
    reading = "reading"
    to_read = "to-read"
    completed = "completed"

class Book(Document):
    title: str
    author: str
    genre: str
    book_status: BookStatus = BookStatus.to_read
    rating: int
    userId: str  # Reference to the user who added this book
    isbn: Optional[str] = None
    dateStarted: Optional[datetime] = None
    dateCompleted: Optional[datetime] = None
    review: Optional[str] = None
    createdAt: datetime = datetime.now()
    updatedAt: datetime = datetime.now()
    cover_image: Optional[str] = None

    class Settings:
        name = "books"  # Specify the collection name for Book documents


class BookRequest(BaseModel):
    title: str
    author: str
    genre: str
    book_status: BookStatus = BookStatus.to_read
    rating: int

    isbn: Optional[str] = None
    dateStarted: Optional[datetime] = None
    dateCompleted: Optional[datetime] = None
    review: Optional[str] = None
    cover_image: Optional[str] = None
