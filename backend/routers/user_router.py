from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from models.user_model import User

from auth.jwt_auth import Token, TokenData, create_access_token, decode_jwt_token

pwd_context = CryptContext(schemes=["bcrypt"])


class HashPassword:
    def create_hash(self, password: str):
        return pwd_context.hash(password)

    def verify_hash(self, input_password: str, hashed_password: str):
        return pwd_context.verify(input_password, hashed_password)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
hash_password = HashPassword()


def get_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    if decode_jwt_token(token) is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    print(token)
    return decode_jwt_token(token)


user_router = APIRouter()


# signup route
@user_router.post("/signup")
async def signup(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # check if user already exists
    existing_user = await User.find_one({"username": form_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create new user with hashed password
    hashed_password = hash_password.create_hash(form_data.password)
    new_user = User(
        username=form_data.username,
        email=form_data.username,  # Using username as email for simplicity
        password=hashed_password,
    )

    await new_user.insert()
    return {"message": "User created successfully"}


# login route
@user_router.post("/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    ## Authenticate user by verifying the user in the database
    user = await User.find_one({"username": form_data.username})
    if user:
        authenticated = hash_password.verify_hash(form_data.password, user.password)
        if authenticated:
            # update the last login time
            user.lastlogin = datetime.now()
            await user.save()

            # Create access token if authentication is successful
            access_token = create_access_token(
                data={"username": user.username}, expires_delta=timedelta(minutes=60)
            )
            return Token(access_token=access_token)
        else:
            # If password is incorrect, raise an exception
            raise HTTPException(status_code=401, detail="Invalid username or password")
    raise HTTPException(status_code=401, detail="Invalid username or password")


@user_router.post("/logout")
async def logout(current_user: Annotated[dict, Depends(get_user)]) -> dict:
    # Invalidate the token by removing it from the database or marking it as invalid
    # update the last logout time
    user = await User.find_one({"username": current_user["username"]})
    if user:
        user.last_logout = datetime.now()
        await user.save()
    else:
        raise HTTPException(status_code=404, detail="User not found")
    await user.save()
    return {"message": "Logged out successfully"}


## reset password route
@user_router.post("/reset-password")
async def reset_password(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    # check if user exists
    user = await User.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username not registered",
        )

    # Create new password with hashed password
    hashed_password = hash_password.create_hash(form_data.password)
    user.password = hashed_password
    await user.save()
    return {"message": "Password reset successfully"}
