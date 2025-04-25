from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from models.my_config import get_settings
from models.book_model import Book
from models.user_model import User


async def init_db():
    my_config = get_settings()
    client = AsyncIOMotorClient(my_config.connection_string)
    db = client["bookkeepr_db"]
    await init_beanie(database=db, document_models=[Book, User])
