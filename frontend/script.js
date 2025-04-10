const api = 'http://localhost:8000/books';
let books = [];

const getBooks = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        books = JSON.parse(xhr.responseText);
        displayBooks(books);
      }
    };
  
    xhr.open('GET', api, true);
    xhr.send();
};

// Save Book (Handling both POST and PUT methods)
const editBook = (id) => {
    console.log(`Editing book ID=${id}`);

    // Find the book from the list
    const book = books.find((book) => book.id === id);

    if (book) {
        // Populate modal with book data
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-genre').value = book.genre;
        document.getElementById('book-status').value = book.book_status;
        document.getElementById('book-rating').value = book.rating;
        
        // Store the book ID in the hidden input
        document.getElementById('book-id').value = id;

        // Open the modal
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
    }
};

// post book function
const postBook = () => {
    const titleInput = document.getElementById('book-title');
    const title = titleInput.value;
    const authorInput = document.getElementById('book-author');
    const author = authorInput.value;
    const genreInput = document.getElementById('book-genre');
    const genre = genreInput.value;
    const book_statusInput = document.getElementById('book-status');
    const book_status = book_statusInput.value;
    const ratingInput = document.getElementById('book-rating');
    const rating = parseInt(ratingInput.value);
    
    // Improved validation with custom error display
    let errorMessage = "";
    if (!title) errorMessage = "Please enter a book title.";
    else if (!author) errorMessage = "Please enter an author name.";
    else if (!genre) errorMessage = "Please enter a genre.";
    else if (!rating) errorMessage = "Please enter a rating.";
    else if (rating < 1 || rating > 5) errorMessage = "Rating must be between 1 and 5.";
    
    if (errorMessage) {
        alert(errorMessage);
        return false; // Prevent form submission
    }
    
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 201) {
            getBooks(); // Reload books
            resetModal();
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            modal.hide(); // Close modal after saving
        }
    };
    xhr.open('POST', api, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({ title, author, genre, book_status, rating }));
    
    return true; // Indicate successful submission
};

// Update existing book
const updateBook = (id) => {
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const genre = document.getElementById('book-genre').value;
    const book_status = document.getElementById('book-status').value;
    const rating = parseInt(document.getElementById('book-rating').value);
    
    // Improved validation with custom error display
    let errorMessage = "";
    if (!title) errorMessage = "Please enter a book title.";
    else if (!author) errorMessage = "Please enter an author name.";
    else if (!genre) errorMessage = "Please enter a genre.";
    else if (!rating) errorMessage = "Please enter a rating.";
    else if (rating < 0 || rating > 5) errorMessage = "Rating must be between 0 and 5.";
    
    if (errorMessage) {
        alert(errorMessage);
        return false; // Prevent form submission
    }
    
    const bookData = { title, author, genre, book_status, rating };
    
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getBooks(); // Reload books after updating
            resetModal();
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            modal.hide(); // Close modal after saving
        }
    };
    xhr.open('PUT', `${api}/${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(bookData));
    
    return true; // Indicate successful submission
};

// delete book function
const deleteBook = (id) => {
    console.log(`deleting Book ID=${id}`);

    if(confirm('Are you sure you want to delete this book?')){
        console.log(`Deleting Book ID=${id}`);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                getBooks(); //reloads books
                console.log(`Deleted Book ID=${id}`);
            }
        };

        xhr.open('DELETE', `${api}/${id}`, true);
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


                <button id="edit-${book.id}" class="btn btn-warning">Edit Book</button>
                <button id="delete-${book.id}" class="btn btn-danger">Delete Book</button>
            </div>
        `;
        bookList.appendChild(bookElement);
        
        // Add event listeners after adding the element to the DOM
        document.getElementById(`edit-${book.id}`).addEventListener('click', () => editBook(book.id));
        document.getElementById(`delete-${book.id}`).addEventListener('click', () => deleteBook(book.id));
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
      const username = document.getElementById('new-username').value.trim();
      const password = document.getElementById('new-password').value;
  
      if (!username || !password) {
        alert("Please fill in both fields.");
        return;
      }
  
      const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
      const userExists = existingUsers.some(u => u.username === username);
  
      if (userExists) {
        alert("Username already exists.");
        return;
      }
  
      const newUser = { username, password };
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      alert("Account created!");
  
      const modalEl = document.getElementById('createAccountModal');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
  
      document.getElementById('new-username').value = '';
      document.getElementById('new-password').value = '';
    });
  });
    