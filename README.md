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
- **`index.html`**, **`login.html`**, **`script.js`**, **`style.css`**  
  Core HTML, JavaScript, and CSS files that power the user interface.  
  - **Styling** is done using **Bootstrap 5** and custom CSS for responsiveness and visual enhancements.

### Backend

#### `main.py`  
- Entry point of the FastAPI application.  
- Serves frontend files, connects to the database, and registers all routers.


#### Models (`models/`)
Defines the structure and behavior of core application data using Pydantic and Beanie.
- **`__init__.py`** – Initializes the models package.  
- **`book_model.py`** – Schema and structure for book documents.  
- **`user_model.py`** – Schema for user accounts and roles.  
- **`todo.py`** – Enum for book status options (e.g., to-read, completed).  
- **`my_config.py`** – Stores and manages environment/configuration settings.


#### Routers (`routers/`)
Defines application routes and business logic.
- **`book_router.py`** – Endpoints for adding, editing, deleting, and filtering books.  
- **`todo_routes.py`** – Handles book status updates and task-like features.  
- **`user_router.py`** – Manages user registration, login, and admin controls.


#### Authentication (`auth/`)
- **`jwt_auth.py`**  
  - Handles JWT access token generation and decoding.  
  - Used for secure login, session validation, and user role management.


#### Database (`db/`)
- **`data_base.py`**  
  - Connects to MongoDB using Beanie ODM.  
  - Registers `Book` and `User` models with the database.


### Tech Stack Notes
- **Pydantic** is used for input validation.  
- **Beanie** integrates with MongoDB for schema modeling and data queries.

---

## Acknowledgements
We would like to acknowledge Professor Changhui Xu and Teaching Assistant Maaz Bin Musa for assistance on this project. 

_This app was built using FastAPI, MongoDB Atlas, Beanie ODM, Bootstrap 5, Open Library API (https://openlibrary.org/)_





