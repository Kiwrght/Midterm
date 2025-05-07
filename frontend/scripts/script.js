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
});


function getBooks(){
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("You need to log in before accessing books.");
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status == 200){
                books.length = 0; // Reset books array before adding new ones
                books.push(...JSON.parse(xhr.responseText)); // Store books globally
                console.log("Books Stored Locally:", books); // Debugging check
                // const books = JSON.parse(xhr.responseText);
                // console.log("Fetched Books fromAPI:", books);
                displayBooks(books);
            }
        } else if (xhr.status == 401) {
            // Unauthorized - redirect to login
            alert("Please log in to view books");
        }
    }; 
    xhr.open('GET', `${api}/my-books`, true);
    if(token){
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send();
}


// post book function
const postBook = () => {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const genre = document.getElementById('book-genre').value.trim();
    const book_status = document.getElementById('book-status').value;
    const rating = parseInt(document.getElementById('book-rating').value);
    
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("You need to log in before adding a book.");
        return false;
    }
    // Improved validation with custom error display
    let errorMessage = "";
    if (!title) errorMessage = "Please enter a book title.";
    else if (!author) errorMessage = "Please enter an author name.";
    else if (!genre) errorMessage = "Please enter a genre.";
    else if (isNaN(rating) || rating < 1 || rating > 5) errorMessage = "Please enter a rating between 1 and 5.";
    
    if (errorMessage) {
        alert(errorMessage);
        return false; // Prevent form submission
    }
    
    const bookData = { title, author, genre, book_status, rating };

    fetch('http://localhost:8000/books/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(bookData)
    })
    .then(response => {
        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);
        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    
        return response.json();
    })
    .then(data => {
        alert("Book added successfully!");
        getBooks(); // Reload books
        resetModal();
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide(); // Close modal after saving
    })
    .catch(error => {
        console.error('Error Adding Book:', error);
        alert(`Error adding book: ${error.message}`);
    });
    
    return true; // Indicate successful submission
};

// Generates the editing modal and populates it with the book data
// This function is called when the user clicks the "Edit Book" button
const editBook = (_id) => {

    console.log(`Editing book ID=${_id}`);
   

    const xhr = new XMLHttpRequest();
     xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(xhr.responseText, "application/xml");

                const book = {
                    title: xmlDoc.getElementsByTagName("title")[0]?.textContent || "",
                    author: xmlDoc.getElementsByTagName("author")[0]?.textContent || "",
                    genre: xmlDoc.getElementsByTagName("genre")[0]?.textContent || "",
                    book_status: xmlDoc.getElementsByTagName("status")[0]?.textContent || "reading",
                    rating: xmlDoc.getElementsByTagName("rating")[0]?.textContent || "0",
                };

                book.book_status = book.book_status.includes("BookStatus.") ? book.book_status.split(".")[1] : book.book_status;

                console.log("Fetched Book Data:", book);

                // Populate modal with book data before opening it
                document.getElementById('book-title').value = book.title;
                document.getElementById('book-author').value = book.author;
                document.getElementById('book-genre').value = book.genre;
                document.getElementById('book-status').value = book.book_status;
                document.getElementById('book-rating').value = book.rating;
                document.getElementById('book-id').value = _id;  // Store the ID for saving

                console.log("Corrected Book Status:", book.book_status);

                // Open the modal after setting values
                const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
                modal.show();   
                console.log("Modal opened with book data:", book);

            } else {ook
                console.error(`Error updating book: ${xhr.status} ${xhr.statusText}`);
            }
        }
    };

    xhr.open("GET", `${api}/${_id}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("access_token")}`);
    xhr.send();

};

//Update book function will send the updated book data to the backend
// This function is called when the user clicks the "Save" button in the modal
const updateBook = (_id) => {
    console.log(`Updating Book ID=${_id}`);
    let rawStatus = document.getElementById("book-status").value.trim();
    let correctedStatus = rawStatus.includes("BookStatus.") ? rawStatus.split(".")[1] : rawStatus || "reading";

    console.log(`Corrected book_status being sent: ${correctedStatus}`);

    // Debugging: Check final formatted status before sending
    console.log(`Received corrected book_status: ${correctedStatus}`);
    // Build XML body for the request
    // Build XML body correctly
    const updatedBookXML = `<?xml version="1.0" encoding="UTF-8"?>
        <book>
            <title>${document.getElementById('book-title').value.trim()}</title>
            <author>${document.getElementById('book-author').value.trim()}</author>
            <genre>${document.getElementById('book-genre').value.trim()}</genre>
            <status>${correctedStatus}</status>
            <rating>${document.getElementById('book-rating').value.trim()}</rating>
        </book>
    `;

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(`Updated Book ID=${_id}`);
                getBooks();  // Refresh book list after update


            } else {
                console.error(`Error updating book: ${xhr.status} ${xhr.statusText}`);
                console.log("Server response:", xhr.responseText);
            }
        }
    };
    console.log("Final XML being sent:", updatedBookXML);
    xhr.open("PUT", `${api}/${_id}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("access_token")}`);
    xhr.setRequestHeader("Content-Type", "application/xml"); 
    xhr.send(updatedBookXML); 
};



// delete book function
const deleteBook = (_id) => {
    //Find the book in the list
    if(confirm('Are you sure you want to delete this book?')){
        console.log(`Deleting Book ID=${_id}`);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 ) {
                if(xhr.status === 200){
                console.log(`Deleted Book ID=${_id}`);
                getBooks(); 

                } else {
                    console.error(`Error deleting book: ${xhr.status} ${xhr.statusText}`);
                }
            }
        };


        xhr.open('DELETE', `${api}/${_id}`, true);
        xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("access_token")}`);
        xhr.send();
    }
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


// display books function
const displayBooks = (books) => {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // clears existing content

    console.log("Books Passed to displayBooks:", books);
    books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.className = `col-12 col-md-4 card mb-3 ${getCardColor(book.book_status)}`;
        bookElement.innerHTML = `
            <div class="card-body">
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

        document.getElementById("book-list").addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-btn")) {
                editBook(event.target.dataset.id); // Uses `data-id` for dynamic retrieval
            }
            if (event.target.classList.contains("delete-btn")) {
                deleteBook(event.target.dataset.id);
            }
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
fetch("http://localhost:8000/users/all", {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
})
.then(response => response.json())
.then(users => {
    //console.log("User List:", users); // Debugging check
    console.log("Calling populateUserList with users:", users); // Debugging check
    populateUserList(users); // Populate the user list in the UI

})
.catch(err => console.error("Error fetching users:", err));
};

//populates all the books in the database
const fetchAllBooks = () => {
    fetch("http://localhost:8000/books/all-books", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    })
    .then(response => response.json())
    .then(books => {
        console.log("All Books in DB:", books);
        displayBooks(books);
    })
    .catch(error => console.error("Error fetching books:", error));
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
        await deleteUser(username);  // Delete user
    }
});

const updateUserRole = async (username, newRole) => {
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`http://localhost:8000/users/${username}/promote`, {  
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to promote user.");
        }

        console.log(`Promoted ${username} to Admin`);
        fetchUsers();

    } catch (error) {
        console.error("Error promoting user:", error);
        alert(error.message);
    }
};

const deleteUser = async (username) => {
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`http://localhost:8000/users/${username}`, {  
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete user.");
        }

        console.log(` Deleted user: ${username}`);
        fetchUsers();  // Refresh user list after deletion
    } catch (error) {
        console.error(" Error deleting user:", error);
        alert(error.message);
    }
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
