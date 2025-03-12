from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from todo_routes import todo_router

app = FastAPI()
app.include_router(todo_router)


@app.get("/")
async def home():
    return FileResponse("./frontend/index.html")


app.mount("/", StaticFiles(directory="./frontend"), name="static")
