from beanie import Document


class User(Document):
    username: str
    password: str

    class Settings:
        name = "users"  # Specify the collection name for User documents
