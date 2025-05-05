const api = 'http://localhost:8000/books';
let books = [];


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
                const books = JSON.parse(xhr.responseText);
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

    // ✅ Debugging: Check final formatted status before sending
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

    // Set up filter buttons
    document.getElementById('filter-reading').addEventListener('click', () => {
        const filteredBooks = books.filter(book => book.book_status === 'reading');
        displayBooks(filteredBooks);
    });

    document.getElementById('filter-to-read').addEventListener('click', () => {
        const filteredBooks = books.filter(book => book.book_status === 'to-read');
        displayBooks(filteredBooks);
    });

    document.getElementById('filter-completed').addEventListener('click', () => {
        const filteredBooks = books.filter(book => book.book_status === 'completed');
        displayBooks(filteredBooks); 
    });

    document.getElementById('filter-all').addEventListener('click', () => {
        displayBooks(books); 
    });
};

// load books and initialize event listeners when the page loads
(() => {
    getBooks();
    initializeEventListeners();
})();



document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("create-account-button").addEventListener("click", function () {
        console.log("Create account button clicked");

        // getting user input from signup
      const username = document.getElementById('new-username').value.trim();
      const email = document.getElementById('new-email').value.trim();
      const password = document.getElementById('new-password').value;
        
      // validating input
      if (!username || !password || !email) {
        alert("Please fill in all fields.");
        return;
      }
  
    //   const formBody = new URLSearchParams();
    //   formBody.append("username", username);
    //   formBody.append("password", password);
    
    // Debugging output of user input
    console.log("Sending request payload:", JSON.stringify({
        username: username,
        email: email,
        password: password,
    }));
      
      // create account
      fetch('http://localhost:8000/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
          })
      })
      .then(async res => {
        if (!res.ok){
        return res.json().then(data => {
            throw new Error(data.detail || "Registration failed");
          } );
        }
        return res.json();
      })
      .then(data => {
        
        alert("Account created successfully! You can now log in.");
        alert("Button clicked, trying to close modal");
        //Hide the modal after successful account creation
        const modalEl = document.getElementById('createAccountModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();

        //clear input fields
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
    })
      .catch(error => {
        console.error("Registration error: ",error);
        alert(error.message || "Could not create account on the server.");
      });      
    });


});


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sign-in-btn").addEventListener("click", function () {
        
        // getting user input from login
        console.log("Sign In button clicked");
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // validating input
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        // formatting credentials
        const formBody = new URLSearchParams();
        formBody.append("username", username);
        formBody.append("password", password);

        // sending POST request to backend login route
        // calling exact route
        console.log("Sending login request with:", JSON.stringify({ username, password }));
        fetch('http://localhost:8000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody,
        })
    
        .then(async res => {
            if (!res.ok){
            const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }
            return res.json();
        })
        // save token, update page
        .then(data => {
            localStorage.setItem("access_token", data.access_token);
            showLoggedInUser(username);
            alert("Logged in successfully!");

            // Hide the modal after successful login
            const modalEl = document.getElementById('signInModal');
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();
            getBooks(); // Reload books after login

            //make the sign out button visible
            document.getElementById("sign-out-btn").style.display = "block";
            
        
        })
  

        // Trying something 
        .catch(error => {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        });

        // show user has logged in
        function showLoggedInUser(username) {
        const userDisplay = document.getElementById('logged-in-user');
        userDisplay.textContent = `Logged in as ${username}`;
        
        }        
    });
});


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

/* ADMIN CONTROLS: 
    - Promote/Demote users
    - Delete users
*/

// Decode user token
const decoded = parseJwt(token);
if (decoded.role === "admin") {
  // show admin-only content
}
container.innerHTML = "";
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
