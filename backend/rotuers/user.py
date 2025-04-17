from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from api.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from auth.jwt_auth import Token, TokenData, create_access_token, decode_jwt_token

pwd_context = CryptContext(schemes=["bcrypt"])

class HashPassword:
    def create_hash(self, password: str):
        return pwd_context.hash(password)
    
    def verify_hash(self,input_password:str, hashed_password:str):
        return pwd_context.verify(input_password, hashed_password)
    
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
hash_password = HashPassword()

def get_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    print(token)
    return decode_jwt_token(token)

user_router = APIRouter()

@user_router.post("/signup")
async def signup():...

@user_router.post("/login")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordBearer,Depends()]) -> Token:
   ## Authenticate user by verifying the user in DB
   username = form_data.username
   for u in memory_db:
       if u["username"] == username:
           authenticated = hash_password.verify_hash(form_data.password, u["password"])
           if authenticated:
                access_token = create_access_token(data={"username": username})
                return Token(access_token=access_token)
           
    raise HTTPException(status_code=401, detail="Invalid Username or Password")