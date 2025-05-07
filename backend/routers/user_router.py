from datetime import datetime, timedelta
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from models.user_model import User, UserRequest, UserDto

from auth.jwt_auth import (
    LoginResult,
    TokenData,
    create_access_token,
    decode_jwt_token,
)

pwd_context = CryptContext(schemes=["bcrypt"])


class HashPassword:
    def create_hash(self, password: str):
        return pwd_context.hash(password)

    def verify_hash(self, input_password: str, hashed_password: str):
        return pwd_context.verify(input_password, hashed_password)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
hash_password = HashPassword()


def get_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:

    print(f"Received token: {token}")  # Debugging statement
    user_data = decode_jwt_token(token)
    if user_data is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    print(f"Authenticated user: {user_data}")
    return user_data


user_router = APIRouter()


# signup route
@user_router.post("/signup")
async def signup(user: UserRequest) -> dict:
    # check if user already exists
    existing_user = await User.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create new user with hashed password
    hashed_password = hash_password.create_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password,
    )

    await new_user.create()

    access_token = create_access_token(
        {"username": new_user.username, "role": new_user.role}
    )

    print("Generated Token:", access_token)  # Debugging statement

    return {
        "access_token": access_token,
        "role": new_user.role,
        "message": "User created successfully",
    }


# login route
@user_router.post("/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> LoginResult:
    ## Authenticate user by verifying the user in the database
    username = form_data.username
    existing_user = await User.find_one({"username": username})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Username or Password",
        )

    authenticated = hash_password.verify_hash(
        form_data.password, existing_user.password
    )
    if authenticated:
        # update the last login time
        existing_user.lastLogin = datetime.now()
        await existing_user.save()

        # Create access token if authentication is successful
        access_token = create_access_token(
            data={"username": existing_user.username, "role": existing_user.role},
            expires_delta=timedelta(minutes=60),
        )
        return LoginResult(
            access_token=access_token,
            username=existing_user.username,
            role=existing_user.role,
        )
    else:
        # If password is incorrect, raise an exception
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )


@user_router.post("/logout")
async def logout(current_user: Annotated[dict, Depends(get_user)]) -> dict:
    print(f"Logging out user: {current_user}")  # Debugging statement

    # Invalidate the token by removing it from the database or marking it as invalid
    # update the last logout time
    user = await User.find_one({"username": current_user["username"]})

    print(f"Found user: {user.username}")
    user.lastLogout = datetime.now()
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


####################################################################################
### Admin User Management Routes ###
####################################################################################
# Get all users route ADMIN ONLY
@user_router.get("/all", response_model=List[UserDto])
async def get_all_users(current_user: Annotated[TokenData, Depends(get_user)]):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    users = await User.find_all().to_list()
    return [
        UserDto(id=str(u.id), username=u.username, email=u.email, role=u.role)
        for u in users
    ]


# Promote a user to admin (admin only)
@user_router.put("/{username}/promote")
async def promote_user(
    username: str, current_user: Annotated[TokenData, Depends(get_user)]
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = "admin"
    await user.save()
    return {"message": f"User '{username}' promoted to admin."}


# Delete a user (admin only)
@user_router.delete("/{username}")
async def delete_user(
    username: str, current_user: Annotated[TokenData, Depends(get_user)]
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await user.delete()
    return {"message": f"User '{username}' has been deleted."}
