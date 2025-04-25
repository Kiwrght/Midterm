from datetime import datetime, timedelta, timezone
import jwt
from pydantic import BaseModel
from models.my_config import get_settings


class LoginResult(BaseModel):
    username: str
    role: str
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str
    role: str
    exp: datetime


ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    payload = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    payload.update({"exp": expire})
    key = get_settings().secret_key
    encoded = jwt.encode(payload, key, algorithm=ALGORITHM)
    return encoded


def decode_jwt_token(token: str) -> TokenData | None:
    try:
        key = get_settings().secret_key
        payload = jwt.decode(token, key, algorithms=[ALGORITHM])
        print(payload)
        username: str = payload.get("username")
        role: str = payload.get(
            "role", ""
        )  # Default to empty string if role is not present
        exp: int = payload.get("exp")

        if username is None or exp is None:
            print("Invalid token")
            return None
        return TokenData(
            username=username,
            role=role,
            exp=datetime.fromtimestamp(exp, tz=timezone.utc),
        )
    except jwt.InvalidTokenError:
        print("Invalid token")
        return None
