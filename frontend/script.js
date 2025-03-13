const api = 'http://localhost:8000/books';
let books = [];

document.getElementById('add-book').addEventListener('click', (e) => {
    resetModal(); // Reset the modal form
    e.preventDefault();
    postBook();
    const closeBtn = document.getElementById('close-modal');
    closeBtn.click();
});

//Save Book (Handling both POST and PUT methods)
const saveBook = () => {
    const id = document.getElementById('book-id').value; // Checks if there is already a book ID
    const title = document.getElementById('new-title').value;
    const author = document.getElementById('new-author').value;
    const genre = document.getElementById('new-genre').value;
    const book_status = document.getElementById('new-status').value;
    const rating = document.getElementById('new-rating').value;

    if(title && author && genre && book_status && rating && rating >= 1 && rating <= 5){
        const bookData = { title, author, genre, book_status, rating };

        if (id) {
            updateBook(id, bookData);
        }
        else {
            postBook(bookData);
        }
    }
    else{
        alert('Invalid input. Please fill all fields and use a rating between 1 and 5.');
    }
};


//post book function
const postBook = () =>{
    const titleInput = document.getElementById('new-title');
    const title =titleInput.value;
    const authorInput = document.getElementById('new-author');
    const author = authorInput.value;
    const genreInput = document.getElementById('new-genre');
    const genre = genreInput.value;
    const book_statusInput = document.getElementById('new-status');
    const book_status = book_statusInput.value;
    const ratingInput = document.getElementById('new-rating');
    const rating = ratingInput.value;
    
    if (title && author && genre && book_status && rating && rating >= 1 && rating <= 5) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                getBooks(); //reloads books
            }
        };
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

//update books status function
const updateBookStatus = (bookId, newStatus) => {
    console.log(`Updating book status: Book ID=${bookId}, Status=${newStatus}`);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getBooks(); //reloads books
            console.log(`Updated book status: Book ID=${bookId}`);
        }
    };

    xhr.open('PUT', `${api}/${bookId}/status`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({ book_status: newStatus }));
}

//Edit existing book function
const editBook = (id) => {
    const book = books.find((book) => book.id === id);

    if (book){

    // Populate the modal with the book data
    document.getElementById('new-title').value = book.title;
    document.getElementById('new-author').value = book.author;
    document.getElementById('new-genre').value = book.genre;
    document.getElementById('new-status').value = book.book_status;
    document.getElementById('new-rating').value = book.rating;

    document.getElementById('modalLabel').textContent = 'Edit Book';

    // Open the modal for editing
    const modal = new bootstrap.Modal(document.getElementById('addModal'));
    modal.show();

    document.getElementById('save-book').onclick = () => saveBook();
    }
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
    document.getElementById('new-title').value = '';
    document.getElementById('new-author').value = '';
    document.getElementById('new-genre').value = '';
    document.getElementById('new-status').value = '';
    document.getElementById('new-rating').value = '';
    document.getElementById('book-id').value = '';
};

const getBooks = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        books = JSON.parse(xhr.responseText);
        console.log(books);
        displayBooks(books);
      }
    };
  
    xhr.open('GET', api, true);
    xhr.send();
  };

//load books on  the page
(() => {
    getBooks();
})();