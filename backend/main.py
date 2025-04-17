from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from todo_routes import todo_router
from backend.db.data_base import init_db
from backend.routers.user_router import user_router
from backend.routers.book_router import book_router
from models.my_config import MyConfig


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


@app.on_event("startup")
async def startup_event():
    await init_db()


app.include_router(todo_router, tags=["Books"], prefix="/books")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


@app.get("/")
async def home():
    return FileResponse("../frontend/index.html")


app.include_router(user_router, tags=["Users"], prefix="/users")
app.include_router(book_router, tags=["Books"], prefix="/books")

app.mount("/", StaticFiles(directory="../frontend"), name="static")

# Setting up the config file
setting = MyConfig()
print(setting.connection_string)
