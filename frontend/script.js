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

  

//Save Book (Handling both POST and PUT methods)
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

        // Open the modal
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();

        // Add event listener to "Save" button for updating
        document.getElementById('save').onclick = () => {
            const title = document.getElementById('book-title').value;
            const author = document.getElementById('book-author').value;
            const genre = document.getElementById('book-genre').value;
            const book_status = document.getElementById('book-status').value;
            const rating = document.getElementById('book-rating').value;

            if (title && author && genre && book_status && rating && rating >= 1 && rating <= 5) {
                const bookData = { title, author, genre, book_status, rating };

                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        getBooks(); // Reload books after updating
                        modal.hide(); // Close modal after saving
                    }
                }
                xhr.open('PUT', `${api}/${id}`, true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.send(JSON.stringify(bookData));
            } else {
                alert('Invalid input. Please fill all fields and use a rating between 1 and 5.');
            }
        };
    }
};

//post book function
const postBook = () =>{
    const titleInput = document.getElementById('book-title');
    const title =titleInput.value;
    const authorInput = document.getElementById('book-author');
    const author = authorInput.value;
    const genreInput = document.getElementById('book-genre');
    const genre = genreInput.value;
    const book_statusInput = document.getElementById('book-status');
    const book_status = book_statusInput.value;
    const ratingInput = document.getElementById('book-rating');
    const rating = ratingInput.value;
    
    if (title && author && genre && book_status && rating && rating >= 1 && rating <= 5) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                getBooks(); //reloads books
                resetModal();
            }
        };
        xhr.open('POST', api, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify({ title, author, genre, book_status, rating }));
    } 
    else{
        alert('Invalid input. Please fill all fields and use a rating between 1 and 5.');
    }
};



//delete book function
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

//display books function
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
                <p class="card-text">Status: ${book.book_status}</p>
                <p class="card-text">Rating: ${book.rating}</p>


                <button id ="edit" class="btn btn-warning" onclick="editBook(${book.id})">Edit Book</button>
                <button class="btn btn-danger" onclick="deleteBook(${book.id})">Delete Book</button>
            </div>
        `;
        bookList.appendChild(bookElement);
        
    });
};

// Helper function to set color based on status
const getCardColor = (status) => {
    if (status === 'reading') return 'bg-warning'; // Yellow for reading
    if (status === 'to-read') return 'bg-info'; // Blue for to-read
    if (status === 'completed') return 'bg-success'; // Green for completed
    return 'bg-light'; // Default color
};

//reset modal function
const resetModal = () => {
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-genre').value = '';
    document.getElementById('book-status').value = '';
    document.getElementById('book-rating').value = '';
};

//Button Code

document.getElementById('add-book').addEventListener('click', (e) => {
    document.getElementById('save').addEventListener('click', (e) => {
        e.preventDefault();
        postBook();
        const closeBtn = document.getElementById('close');
        closeBtn.click();
    });
});

// Filter Books by Status
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


//load books on  the page
(() => {
    getBooks();
})();