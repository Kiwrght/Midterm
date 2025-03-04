from fastapi import FastAPI
from todo import Book
from todo_routes import todo_router

app = FastAPI(title="Library API")
app.include_router(todo_routes)


@app.get("/")
async def home():
    return {"message": "Welcome to the Library API"}
