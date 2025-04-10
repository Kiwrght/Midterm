from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from todo_routes import todo_router

from models.my_config import MyConfig

app = FastAPI(title="My Book Library")
app.include_router(todo_router, tags=["Books"], prefix="/books")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


@app.get("/")
async def home():
    return FileResponse("./frontend/index.html")


app.mount("/", StaticFiles(directory="./frontend"), name="static")

# Setting up the config file
setting = MyConfig()
print(setting.connection_string)
