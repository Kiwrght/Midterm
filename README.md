# Assignment 4: User Login

## Bookkeepr App
This project extends the mid-term Bookkeepr App by integrating MongoDB as a persistent database and implementing a user login feature. Instead of storing book and user information in memory, the app now securely stores data in a real MongoDB database.


## Overview
- ### Database integration
Migrated all book and user data from in-memory storage to MongoDB Atlas using FastAPI and Beanie ODM.

- ### User Authentication 
Added a user login system using JWT (JSON Web Tokens) for authentication. Users can register and securely log in to manage their books.


## File Structure
- ### Front End
```index.html```  , ```script.js``` , ```style.css``` : Used to style the app using HTML, JavaScript, and CSS.

Bootstrap5 and custom CSS were used to build the design and create enhancements in the app.

- ### Back End
```main.py``` , ```todo.py``` , ```todo_routes.py``` , ```jwt_auth.py``` , ```data_base.py``` : Uses Fast API and python.

Data models in this app are built with Pydantic for request validation and Beanie for MongoDB document modeling. This allows structured data validation and direct interaction with the MongoDB database.


## Features
- Book management: Adding, editing, and deleting books within the collection.
- Filtering: Ability to filter books based on reading status.
- Rating system: Rate a book based on a scale of 1–5.
- Color coding: Visual status indication with different card colors based on the user's reading status.


## Acknowledgements
We would like to acknowledge Professor Changhui Xu and Teaching Assistant Maaz Bin Musa for assistance on this project. As well as FastAPI for the backend framework, MongoDB for the database, and Bootstrap for front-end Styling.







