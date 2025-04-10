from typing import Optional
from beanie import Document
from datetime import datetime

from todo import BookStatus


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

    class Settings:
        name = "books"  # Specify the collection name for Book documents
