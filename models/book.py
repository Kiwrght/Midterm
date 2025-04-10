from beanie import Document


class Book(Document):
    name: str
    author: str
    genre: str
    review: str
    rating: float

    class Settings:
        name = "books"  # Specify the collection name for Book documents
