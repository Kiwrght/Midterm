from contextlib import asynccontextmanager
import os
from fastapi import FastAPI


from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# from routers.todo_routes import todo_router
from db.data_base import init_db
from routers.user_router import user_router
from routers.book_router import book_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    print("Starting up...")
    # Initialize the database connection
    await init_db()
    yield
    # on shutdown
    print("Shutting down...")


app = FastAPI(title="BookKeepr", version="0.1.0", lifespan=lifespan)

app.include_router(book_router, tags=["Books"], prefix="/books")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],  # Ensure OPTIONS is included
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/")
async def home():
    return FileResponse("../frontend/index.html")


app.include_router(user_router, tags=["Users"], prefix="/users")
app.include_router(book_router, tags=["Books"], prefix="/books")

# Adjust path to point to ../frontend

app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")
