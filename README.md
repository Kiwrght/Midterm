# Bookkeepr

Bookkeepr is a book tracking web application that allows users to create an account, log in, and track the books they are reading, have completed, and want to read. They are able to rate each book, assign a genre, give it a descriptive rating, assign a reading status, track the author, and upload a picture as a cover photo.


## Update

Instead of storing book and user information in memory, the app now securely stores data in a real MongoDB database. This update also inclues account registration and login, unique user and admin functions, an ISBN API for organization and filtering, and an optional picture upload for the book logs.


## Overview
- ### Database integration
Migrated all book and user data from in-memory storage to MongoDB Atlas using FastAPI and Beanie ODM.

- ### User Authentication 
Added a user login system using JWT (JSON Web Tokens) for authentication. Users can register and securely log in to manage their books.


## File Structure
- ### Front End
```index.html``` , ```login.html``` , ```script.js``` , ```style.css``` : Used to style the app using HTML, JavaScript, and CSS.

Bootstrap5 and custom CSS were used to build the design and create enhancements in the app.

- ### Back End
```main.py```:
- #### Models
```__init__.py``` , ```book_model.py``` , ```my_config.py``` , ```todo.py``` , ```user_model.py```:
- ### Routers
```book_router.py``` , ```todo_routes.py``` , ```user_router.py```:
- ### Auth
```jwt_auth.py```:
- ### DB
```data_base.py```:


Data models in this app are built with Pydantic for request validation and Beanie for MongoDB document modeling. This allows structured data validation and direct interaction with the MongoDB database.


## Features
Every user:
- Book management: Adding, editing, and deleting books within the collection.
- Filtering: Ability to filter books based on reading status.
- ISBN search: 
- Rating system: Rate a book based on a scale of 1–5.
- Color coding: Visual status indication with different card colors based on the user's reading status.

Admins:
- User database: Admins can promote or demote user permissions and delete users entirely.


## Acknowledgements
We would like to acknowledge Professor Changhui Xu and Teaching Assistant Maaz Bin Musa for assistance on this project. As well as FastAPI for the backend framework, MongoDB for the database, Bootstrap for front-end Styling, and https://openlibrary.org/ for their ISBN API.






