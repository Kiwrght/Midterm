# Bookkeepr

Bookkeepr is a book tracking web application that allows users to create an account, log in, and track books they are reading, have completed, or want to read. Users can rate each book, assign a genre, add a review, set a reading status, track the author, and upload a cover photo.


## Update

Instead of storing book and user information in memory, the app now securely stores data in a real MongoDB database. This update also inclues account registration and login, unique user and admin functions, an ISBN API for organization and filtering, and an optional picture upload for the book logs.

---

## Overview
- ### Database integration
Migrated all book and user data from in-memory storage to MongoDB Atlas using FastAPI and Beanie ODM.

- ### User Authentication 
Added a user login system using JWT (JSON Web Tokens) for authentication. Users can register and securely log in to manage their books.

---

## Features
All Users:
- Add, update, delete, and view books
- Search books via Open Library ISBN API
- Upload custom cover images
- Filter books by reading status
- Rate books from 1–5
- Color-coded cards based on book status

Admins Only:
- View all registered users
- View all books in the system
- Promote / Demote user roles
- Delete users

---

## File Structure

### Frontend

`index.html`, `login.html`, `script.js`, `style.css`

These files make up the core user interface using HTML, JavaScript, and CSS.  
Bootstrap 5 and custom CSS are used for layout and styling enhancements.

---

### Backend

`main.py`
 
The entry point of the FastAPI server. Serves frontend files, connects to MongoDB, and registers API routes.


#### Models (`models/`)

`__init__.py` `book_model.py` `user_model.py` `todo.py` `my_config.py`
  
Defines the application's core data structures using Pydantic and Beanie.


#### Routers (`routers/`)

`book_router.py` `todo_routes.py` `user_router.py`

Handles all API routing logic.


#### Authentication (`auth/`) 

`jwt_auth.py` 

Manages JWT token creation and validation for secure authentication.


#### Database (`db/`)

`data_base.py`

Connects to MongoDB via Beanie and registers document models.


### Tech Stack Notes
- **Pydantic**: Ensures data validation for incoming requests.
- **Beanie**: ODM layer used to interact with MongoDB through FastAPI.

---

## Acknowledgements
We would like to acknowledge Professor Changhui Xu and Teaching Assistant Maaz Bin Musa for assistance on this project. 

_This app was built using FastAPI, MongoDB Atlas, Beanie ODM, Bootstrap 5, Open Library API (https://openlibrary.org/)_





