from http.client import HTTPException
from fastapi import FastAPI
from model import Book

app = FastAPI(title="Library API")

books = []  # List to store books


@app.post("/books/")
def add_book(book: Book):
    books.append(book.dict())
    return {"message": "Book added successfully", "book": book}


@app.get("/books/")
async def get_books() -> dict:
    return {"books": books}


@app.put("/books/{book_id}")
async def update_book(book_id: int, status: str):
    for book in books:
        if book["id"] == book_id:
            book["status"] = status
            return {"message": "Book status updated successfully", "book": book}
    raise HTTPException(status_code=404, detail="Book not found")


@app.delete("/books/{book_id}")
async def delete_book(book_id: int):
    for book in books:
        if book["id"] == book_id:
            books.remove(book)
            return {"message": "Book deleted successfully"}
    raise HTTPException(status_code=404, detail="Book not found")
