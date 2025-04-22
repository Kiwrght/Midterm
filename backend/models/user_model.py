from datetime import datetime
from typing import Optional  # allows a value to be None without it being an Null  error
from beanie import Document
from pydantic import BaseModel


class User(Document):
    username: str
    email: str
    password: str  # hashed password within the database
    role: str = ""  # Default role for new users
    dateJoined: datetime = datetime.now()
    lastLogin: Optional[datetime] = None

    class Settings:
        name = "users"  # Specify the collection name for User documents


class UserRequest(BaseModel):
    """
    # model for user sign up
    """

    username: str
    email: str
    password: str  # plain text from user input
