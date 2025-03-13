const api = 'http://localhost:8000/books';
let books = [];

document.getElementById('add-book').addEventListener('click', (e) => {
   
    document.getElementById('save-new-book').addEventListener('click', (e) => {
        e.preventDefault();
        postBook();  // Call postBook function when Save button is clicked
        const closeBtn = document.getElementById('add-close');
        closeBtn.click();  // Close the modal after saving the book
    });
});

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

        if(id){
            xhr.open('PUT', `${api}/${id}`, true);
        }
        else{
            xhr.open('POST', api, true);
        }

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
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                getBooks(); //reloads books
                console.log(`deleted Book ID=${id}`);
            }
        };

        xhr.open('DELETE', `${api}/${id}`, true);
        xhr.send();
    }
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

    if (!book) return;

    // Populate the modal with the book data
    document.getElementById('new-title').value = book.title;
    document.getElementById('new-author').value = book.author;
    document.getElementById('new-genre').value = book.genre;
    document.getElementById('new-status').value = book.book_status;
    document.getElementById('new-rating').value = book.rating;

    // Open the modal for editing
    const modal = new bootstrap.Modal(document.getElementById('addModal'));
    modal.show();

    // Event listener for the Save button in the modal
    document.getElementById('save-new-book').addEventListener('click', (e) => {
        e.preventDefault();
        postBook(id);  // Call postBook with the book id to update it
        const closeBtn = document.getElementById('add-close');
        closeBtn.click();  // Close the modal after saving the updated book
    });
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


                <button class="btn btn-warning" onclick="editBook(${book.id})">Edit Book</button>
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