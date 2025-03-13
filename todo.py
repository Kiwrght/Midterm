from pydantic import BaseModel
from enum import Enum


class BookStatus(str, Enum):
    reading = "reading"
    to_read = "to-read"
    completed = "completed"


class Book(BaseModel):
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
