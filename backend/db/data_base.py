from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from backend.models.my_config import MyConfig, get_settings
from backend.models.book_model import Book
from backend.models.user_model import User


async def init_db():
    my_config = MyConfig()
    client = AsyncIOMotorClient(my_config.connection_string)
    db = client["bookkeepr_db"]
    await init_beanie(database=db, document_models=[Book, User])
