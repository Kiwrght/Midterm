from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from models.my_config import MyConfig
from models.book import Book
from models.user import User
import asyncio


async def init_db():
    my_config = MyConfig()
    client = AsyncIOMotorClient(my_config.connection_string)
    db = client["bookkeepr_db"]
    await init_beanie(database=db, document_models=[Book, User])


asyncio.run(init_db())
