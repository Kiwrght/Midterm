from pydantic import BaseModel, Document
from enum import Enum


class BookStatus(str, Enum):
    reading = "reading"
    to_read = "to-read"
    completed = "completed"


class Book(Document):
    id: int
    title: str
    author: str
    genre: str
    book_status: BookStatus  # "reading", "to-read", "completed"
    rating: int


class BookRequest(BaseModel):
    title: str
    author: str
    genre: str
    book_status: BookStatus
    rating: int
