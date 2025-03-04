from model import BaseModel
from typing import List, Optional, Annotated


class Book(BaseModel):
    id: int
    title: str
    author: str
    genre: str
    status: str  # "reading", "to-read", "completed"
