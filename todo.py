from pydantic import BaseModel


class Book(BaseModel):
    id: int
    title: str
    author: str
    genre: str
    book_status: str  # "reading", "to-read", "completed"
    rating: int
