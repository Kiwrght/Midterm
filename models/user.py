from datetime import datetime
from typing import Optional  # allows a value to be None without it being an Null  error
from beanie import Document


class User(Document):
    username: str
    email: str
    password: str
    dateJoined: datetime = datetime.now()
    lastLogin: Optional[datetime] = None

    class Settings:
        name = "users"  # Specify the collection name for User documents
