const api = 'http://localhost:8000/books';
const books = [];

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = atob(base64Url);
        return JSON.parse(decodeURIComponent(escape(base64)));
    } catch (error) {
        console.error("Invalid token format:", error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("user_role");
    console.log("User Role:", userRole); // Debugging check

    if (!token) {
        window.location.href = "login.html"; // Redirect to login if not authenticated
    } else {
        const adminPanel = document.getElementById("adminDropdown");

        if (adminPanel) { 
            adminPanel.style.display = (userRole === "admin") ? "block" : "none"; // Auto-hide for non-admins
        } else {
            console.error("Admin panel element not found in DOM!");
        }
    }

    const downloadButton = document.getElementById("download-books-pdf-btn");
    if (downloadButton) {
        downloadButton.addEventListener("click", () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                alert("No token found. Please log in.");
                return;
            }
            
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "http://localhost:8000/download/pdf", true);
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.responseType = "blob"; // Set response type to blob for file download

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const blob = xhr.response;
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.style.display = "none";
                        a.href = url;
                        a.download = "my_books.pdf"; // File name
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                    } else {
                        alert("Failed to download books as PDF.");
                        console.error(`Error: ${xhr.status} ${xhr.statusText}`);
                    }
                }
            };

            xhr.send();
        });
    } else {
        console.error("Download button with ID 'download-books-pdf-btn' not found in the DOM.");
    }
});


function getBooks() {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("You need to log in before accessing books.");
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                books.length = 0; // Reset books array before adding new ones
                books.push(...JSON.parse(xhr.responseText)); // Store books globally
                console.log("Books Stored Locally:", books); // Debugging check
                displayBooks(books);
            } else if (xhr.status == 401) {
                alert("Please log in to view books");
                window.location.href = "login.html"; // Redirect to login
            } else {
                console.error(`Error fetching books: ${xhr.status} ${xhr.statusText}`);
            }
        }
    };
    xhr.open('GET', `${api}/my-books`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send();
}

/* IMAGE UPLOAD */
//Upload image function
const uploadCoverImage = (file, token) => {
    console.log("File to upload:", file);
    if (!file) return Promise.resolve(null); // No file? Return `null` immediately

    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/books/upload", true);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.cover_image); // Return the uploaded image URL
                } else {
                    console.error("Error uploading image:", xhr.statusText);
                    alert(`Error uploading image: ${xhr.statusText}`);
                    reject(new Error(xhr.statusText));
                }
            }
        };

        xhr.send(formData);
    });
};

/* ADDING BOOK FUNCTIONALITY */
// This function is called when the user clicks the "Add Book" button
const postBook = () => {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const genre = document.getElementById('book-genre').value.trim();
    const book_status = document.getElementById('book-status').value;
    const rating = parseInt(document.getElementById('book-rating').value);
    const review = document.getElementById('book-review').value.trim();
    const fileInput = document.getElementById('book-cover');
    const file = fileInput?.files[0];

    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("You need to log in before adding a book.");
        return false;
    }

    let errorMessage = "";
    if (!title) errorMessage = "Please enter a book title.";
    else if (!author) errorMessage = "Please enter an author name.";
    else if (!genre) errorMessage = "Please enter a genre.";
    else if (isNaN(rating) || rating < 1 || rating > 5) errorMessage = "Please enter a rating between 1 and 5.";

    if (errorMessage) {
        alert(errorMessage);
        return false;
    }

    uploadCoverImage(file, token).then((coverImageBase64) => {
        const bookData = {
            title, author, genre, book_status, rating, review, cover_image: coverImageBase64,
        };

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/books/", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 201) {
                    alert("Book added successfully!");
                    getBooks(); // Reload books
                    resetModal();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                    modal.hide(); // Close modal after saving
                } else {
                    console.error("Error adding book:", xhr.statusText);
                    alert(`Error adding book: ${xhr.statusText}`);
                }
            }
        };

        xhr.send(JSON.stringify(bookData));
    }).catch(error => {
        console.error("Error uploading cover image:", error);
    });

    return true;
};

//This is the function that is called when the user clicks the "Add Book" button for searched books
const addBookToDatabase = (book) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("You need to log in before adding a book.");
        return;
    }

    // Prepare the book data for the backend
    const bookData = {
        title: book.title || "Unknown Title",
        author: book.author || "Unknown Author",
        genre: book.genre || "Unknown Genre",
        book_status: "to-read", // Default status for new books
        rating: 0, // Default rating
        review: "", // Default review
        cover_image: book.cover_image || null, // Use the cover image if available
    };

    // Convert the book data to JSON
    const jsonData = JSON.stringify(bookData);

    // Create a new XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/books/", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    // Handle the response
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                alert("Book added successfully!");
                getBooks(); // Reload the user's books
            } else {
                console.error("Error adding book to database:", xhr.statusText);
                alert(`Error adding book: ${xhr.statusText}`);
            }
        }
    };

    // Send the request with the JSON data
    xhr.send(jsonData);
};


/* EDIT/UPDATE FUNCTIONALITY */

// Generates the editing modal and populates it with the book data
// This function is called when the user clicks the "Edit Book" button
const editBook = (_id) => {
    console.log(`Editing book ID=${_id}`);

    const token = localStorage.getItem("access_token");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${api}/${_id}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const book = JSON.parse(xhr.responseText);
                console.log("Fetched Book Data:", book);

                document.getElementById('book-title').value = book.title || 'Untitled';
                document.getElementById('book-author').value = book.author || 'Unknown';
                document.getElementById('book-genre').value = book.genre || 'Unknown';
                document.getElementById('book-status').value = book.book_status || 'reading';
                document.getElementById('book-rating').value = book.rating || 0;
                document.getElementById('book-review').value = book.review || '';
                document.getElementById('book-id').value = _id;

                const coverPreview = document.getElementById('cover-preview');
                if (book.cover_image) {
                    coverPreview.src = book.cover_image;
                    coverPreview.style.display = 'block';
                } else {
                    coverPreview.style.display = 'none';
                }

                const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
                modal.show();
            } else {
                console.error("Error fetching book details:", xhr.statusText);
                alert(`Error fetching book details: ${xhr.statusText}`);
            }
        }
    };

    xhr.send();
};

const updateBook = (_id) => {
    console.log(`Updating Book ID=${_id}`);

    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const genre = document.getElementById('book-genre').value.trim();
    const book_status = document.getElementById('book-status').value;
    const rating = parseInt(document.getElementById('book-rating').value);
    const review = document.getElementById('book-review').value.trim();
    const fileInput = document.getElementById('book-cover');
    const file = fileInput?.files[0];

    const token = localStorage.getItem("access_token");
    const existingCoverImage = document.getElementById('cover-preview').src;

    // Validate required fields
    if (!title || !author || !genre || isNaN(rating) || rating < 1 || rating > 5) {
        alert("Please fill in all required fields and ensure the rating is between 1 and 5.");
        return;
    }

    uploadCoverImage(file, token).then((coverImageBase64) => {
        const bookData = {
            title,
            author,
            genre,
            book_status,
            rating,
            review,
            cover_image: coverImageBase64 || existingCoverImage,
        };

        // Update the cover preview dynamically
        if (coverImageBase64) {
            const coverPreview = document.getElementById('cover-preview');
            coverPreview.src = coverImageBase64;
            coverPreview.style.display = 'block';
        }

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", `${api}/${_id}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert("Book updated successfully!");
                    getBooks(); // Reload books
                    const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                    modal.hide(); // Close modal after saving
                } else {
                    console.error("Error updating book:", xhr.statusText);
                    alert(`Error updating book: ${xhr.statusText}`);
                }
            }
        };

        xhr.send(JSON.stringify(bookData));
    }).catch(error => {
        console.error("Error uploading cover image:", error);
    });
};

// delete book function
const deleteBook = (_id) => {
    //Find the book in the list
    if(!confirm("Are you sure you want to delete this book?")){
        return; // Exit if user cancels
    }

    console.log(`Deleting Book ID=${_id}`);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 ) {
            if(xhr.status === 200){
            console.log(`Deleted Book ID=${_id}`);
            getBooks(); 

            } else {
                console.error(`Error deleting book: ${xhr.status} ${xhr.statusText}`);
                alert(`Error: ${xhr.statusText}`);
            }
        }
    };
    xhr.open('DELETE', `${api}/${_id}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("access_token")}`);
    xhr.send();

};

// to make "status" is displayed as capitalized in modal
const formatStatus = (status) => {
    console.log("formatStatus called:", status);
    if (!status) return "";
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
};

/* DISPLAY FUNCTIONALITY */
// display created books
const displayBooks = (books) => {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // clears existing content

    console.log("Books Passed to displayBooks:", books);
    books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = `col-12 col-md-4 card mb-3 ${getCardColor(book.book_status)}`;
        bookElement.innerHTML = `
        <div class="card-body">
        ${book.cover_image ? `
            <img src="${book.cover_image}" 
                 class="img-thumbnail" 
                 style="max-width: 100px; max-height: 100px; float: left; margin-right: 10px;" 
                 alt="Book Cover" />
        ` : ''}
        
            <h3 class="card-title">${book.title}</h3>
            <p class="card-text">Author: ${book.author}</p>
            <p class="card-text">Genre: ${book.genre}</p>
            <p class="card-text">Status: ${formatStatus(book.book_status)}</p>
            <p class="card-text">Rating: ${book.rating}</p>
            <button class="btn btn-warning edit-btn" data-id="${book._id}">Edit Book</button>
            <button class="btn btn-danger delete-btn" data-id="${book._id}">Delete Book</button>
        </div>
    `;
        bookList.appendChild(bookElement);
    });
    document.getElementById("book-list").addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            editBook(event.target.dataset.id);
        }
        if (event.target.classList.contains("delete-btn")) {
            deleteBook(event.target.dataset.id);
        }
    });
};

// display searched books
const displaySearchedBooks = (books) => {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // clears existing content

    console.log("Books Passed to displayBooks:", books);
    books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = `col-12 col-md-4 card mb-3 ${getCardColor(book.book_status)}`;
        bookElement.innerHTML = `
        <div class="card-body">
        ${book.cover_image ? `
            <img src="${book.cover_image}" 
                 class="img-thumbnail" 
                 style="max-width: 100px; max-height: 100px; float: left; margin-right: 10px;" 
                 alt="Book Cover" />
        ` : ''}
            <h3 class="card-title">${book.title}</h3>
            <p class="card-text">Author: ${book.author}</p>
           <p class="card-text">Genre: ${book.genre}</p>
            <button class="btn btn-success add-btn" 
                Add Book
            </button>
        </div>
    `;
        bookList.appendChild(bookElement);

        // Add event listener for the "Add Book" button
        bookElement.querySelector(".add-btn").addEventListener("click", () => {
            addBookToDatabase(book); // Pass the entire book object
        });
    });

};


// Helper function to set color based on status
const getCardColor = (status) => {
    if (status === 'reading') return 'reading'; // Yellow for reading
    if (status === 'to-read') return 'to-read'; // Blue for to-read
    if (status === 'completed') return 'completed'; // Green for completed
    return 'bg-light'; // Default color
};

// reset modal function
const resetModal = () => {
    document.getElementById('book-id').value = '';
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-genre').value = '';
    document.getElementById('book-status').value = 'reading'; // Default value
    document.getElementById('book-rating').value = '';
};

// Initialize event listeners once when the page loads
const initializeEventListeners = () => {
    // Handle save button click
    document.getElementById('save').addEventListener('click', (e) => {
        e.preventDefault();
        const bookId = document.getElementById('book-id').value;
        
        let success = false;
        if (bookId) {
            // Update existing book
            success = updateBook(bookId);
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            modal.hide(); // Close modal after saving
            window.location.reload(); // Reload the page to reflect changes
        } else {
            // Add new book
            success = postBook();
        }
    });

    // Reset modal when it's closed or reset button is clicked
    document.getElementById('exampleModal').addEventListener('hidden.bs.modal', resetModal);
    document.getElementById('close').addEventListener('click', resetModal);
    
    document.querySelectorAll(".filter-option").forEach(item => {
        item.addEventListener("click", () => {
            const filterStatus = item.getAttribute("data-filter");
    
            console.log("Filtering for:", filterStatus); // Debugging check
    
            if (filterStatus === "all") {
                displayBooks(books); // Show all books
            } else {
                const filteredBooks = books.filter(book => book.book_status === filterStatus);
                displayBooks(filteredBooks);
            }
        });
    });

    // Admin actions for user management
    document.querySelectorAll(".filter-option").forEach(item => {
        item.addEventListener("click", () => {
            const filterType = item.textContent.trim(); // Get text value
    
            console.log("Admin Action:", filterType); // Debugging check
    
            if (filterType === "Users") {
                fetchUsers(); // Fetch all users dynamically
                document.getElementById("filterDropdown").style.display = "none";
                document.getElementById("add-book").style.display = "none";
    
            } else if (filterType === "All Books") {
                document.getElementById("filterDropdown").style.display = "block";
                document.getElementById("user-list").style.display = "none"; // Hide user list
                fetchAllBooks(); // Fetch all books dynamically
            } else if (filterType === "My Books") {
                document.getElementById("filterDropdown").style.display = "block";
                document.getElementById("user-list").style.display = "none"; // Hide user list
                const addBookBtn = document.getElementById("add-book");
                addBookBtn.style.display = "block";
                addBookBtn.style.margin = "auto";
                displayBooks(books); // Show only the user's books
            }
        });
    });
};

/* SEARCH FUNCTIONALITY */
const searchBooks = async (query) => {
    const encodedQuery = encodeURIComponent(query.trim());

    try {
        let url;
        // Determine the search type based on the query
        if (/^\d{10,13}$/.test(query)) {
            // Query is a 10- or 13-digit number, treat it as ISBN
            url = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodedQuery}&format=json&jscmd=data`;
        } else if (query.includes(" ")) {
            // Query contains spaces, treat it as a title
            url = `https://openlibrary.org/search.json?title=${encodedQuery}`;
        } else {
            // Query is a single word, treat it as an author
            url = `https://openlibrary.org/search.json?author=${encodedQuery}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching books.");
        }

        const data = await response.json();

        // Handle ISBN search results
        if (/^\d{10,13}$/.test(query)) {
            const bookKey = `ISBN:${query}`;
            const book = data[bookKey];
            if (book) {
                console.log("Fetched Book Details:", book);

                // Display the book details or populate the form
                displaySearchedBooks([{
                    title: book.title || "Unknown Title",
                    author: book.authors?.[0]?.name || "Unknown Author",
                    genre: book.subjects?.[0] || "Unknown Genre",
                    cover_image: book.cover?.medium || "",
                }]);
            } else {
                alert("No book found for the given ISBN.");
            }
        } else {
            // Handle Title or Author search results
            const books = data.docs.map(book => ({
                title: book.title || "Unknown Title",
                author: book.author_name?.[0] || "Unknown Author",
                genre: book.subject?.[0] || "Unknown Genre",
                cover_image: book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "",
            }));

            if (books.length === 0) {
                alert("No books found.");
                return;
            }

            console.log("Search Results:", books);
            displaySearchedBooks(books);
        }
    } catch (error) {
        console.error("Error searching books:", error);
        alert(error.message);
    }
};
// Event listener for search input
document.getElementById("search-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevents page reload

    const query = document.getElementById("search-input").value.trim();

    if (!query) {
        alert("Please enter a search term!");
        return;
    }

    console.log(`Searching for: ${query}`); //Debugging output
    await searchBooks(query);
});

/* ADMIN CONTROLS: 
    - Promote/Demote users
    - Delete users
*/

// only Show admin dropdown if user is admin
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access_token");
    if (!token) return; // No token means no login

    const decoded = parseJwt(token); // Decode JWT to get role
    console.log("Decoded Token:", decoded); // Debugging check

    const adminDropdown = document.getElementById("adminDropdown").parentElement;

    if (decoded.role === "admin") {
        adminDropdown.style.display = "block"; // Show dropdown for admins
    } else {
        adminDropdown.style.display = "none"; // Hide dropdown for non-admins
    }
});


// Fetches all the users from the backend
const fetchUsers = () => {
    const token = localStorage.getItem("access_token");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8000/users/all", true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const users = JSON.parse(xhr.responseText);
                console.log("Calling populateUserList with users:", users);
                populateUserList(users);
            } else {
                console.error("Error fetching users:", xhr.statusText);
            }
        }
    };

    xhr.send();
};

//populates all the books in the database
const fetchAllBooks = () => {
    const token = localStorage.getItem("access_token");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8000/books/all-books", true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const books = JSON.parse(xhr.responseText);
                console.log("All Books in DB:", books);
                displayBooks(books);
            } else {
                console.error("Error fetching books:", xhr.statusText);
            }
        }
    };

    xhr.send();
};
  
const populateUserList = (users) => {
    console.log("Populating users on UI:", users); 
    const container = document.getElementById("user-list");
    container.innerHTML = ""; // Clear old entries
    container.style.display = "block";  // Show the user list container

    users.forEach(user => {
        const row = document.createElement("div");
        row.className = "user-row";

        const isAdmin = user.role === "admin";
        const promoteOrDemoteBtn = isAdmin
        ? `<button class="btn btn-sm btn-outline-secondary demote-user" data-user="${user.username}">Demote</button>`
        : `<button class="btn btn-sm btn-success promote-user" data-user="${user.username}">Promote</button>`;

        row.innerHTML = `
        <span><strong>${user.username}</strong></span>
        <span>${user.email}</span>
        <span class="actions">${promoteOrDemoteBtn}</span>
        <span class="actions">
            <button class="btn btn-sm btn-danger delete-user" data-user="${user.username}">Delete</button>
        </span>
        `;
        container.appendChild(row);
    });
};

// Event listeners for Admin User actions
document.addEventListener("click", async (event) => {
    const target = event.target;

    if (target.classList.contains("promote-user")) {
        const username = target.dataset.user;
        console.log(`Promoting user: ${username}`);
        await updateUserRole(username, "admin");  //  Promote user
    }

    if (target.classList.contains("demote-user")) {
        const username = target.dataset.user;
        console.log(`Demoting user: ${username}`);
        await updateUserRole(username, "user");  // Demote user
    }

    if (target.classList.contains("delete-user")) {
        const username = target.dataset.user;
        console.log(`Deleting user: ${username}`);
         deleteUser(username);  // Delete user
    }
});

const updateUserRole = (username, newRole) => {
    const token = localStorage.getItem("access_token");

    const xhr = new XMLHttpRequest();
    const endpoint = newRole === "admin" ? "promote" : "demote";

    console.log(`Updating role for ${username} to ${newRole}`); // Debugging

    xhr.open("PUT", `http://localhost:8000/users/${username}/${endpoint}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(`${newRole === "admin" ? "Promoted" : "Demoted"} ${username}`);
                fetchUsers(); // Refresh the user list
            } else {
                console.error(`Failed to ${newRole === "admin" ? "promote" : "demote"} user: ${xhr.statusText}`);
                alert(`Failed to ${newRole === "admin" ? "promote" : "demote"} user.`);
            }
        }
    };

    xhr.send();
};

const deleteUser = (username) => {
    const token = localStorage.getItem("access_token");

    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://localhost:8000/users/${username}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(`Deleted user: ${username}`);
                fetchUsers(); // Refresh the user list
            } else {
                console.error(`Failed to delete user: ${xhr.statusText}`);
                alert("Failed to delete user.");
            }
        }
    };

    xhr.send();
};

// load books and initialize event listeners when the page loads
(() => {
    getBooks();
    initializeEventListeners();
})();

// Logout function
document.addEventListener("DOMContentLoaded", () => {
    const signOutBtn = document.getElementById("sign-out-btn");
    // Check if the user is logged in and show the sign-out button accordingly
    if (localStorage.getItem("access_token")) {
        signOutBtn.style.display = "block";
    } else {
        signOutBtn.style.display = "none";
    }


    document.getElementById("sign-out-btn").addEventListener("click", function () {

        console.log("Logout button clicked");

        // Clear the token from local storage
        localStorage.removeItem("access_token");
        document.getElementById("sign-out-btn").style.display = "none";


        // Update the UI to show the user is logged out
        const userDisplay = document.getElementById('logged-in-user');
        userDisplay.textContent = 'Logged out';

        // Optionally, you can redirect to a login page or refresh the current page
        window.location.reload(); // Reloads the page to reflect changes


    });
});
