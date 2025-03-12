const api = 'http://localhost:8000/books';
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
    const title = document.getElementById('new-title').value;
    const author = document.getElementById('new-author').value;
    const genre = document.getElementById('new-genre').value;
    const book_status = document.getElementById('new-status').value;
    const rating = parseInt(document.getElementById('new-rating').value, 5);

    if (title && author && genre && book_status && rating) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                getBooks(); //reloads books
            }
        };

        xhr.open('POST', api, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify({ title, author, genre, book_status, rating }));
    } else {
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
    console.log(`Updating book status: Book ID=${id}`);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getBooks(); //reloads books
            console.log(`Updated book status: Book ID=${id}`);
        }
    };
}

//Edit existing book function
const editBook = (id) => {
    const book = books.find((book) => book.id === id);
    const newTitle = book.title;
    const newAuthor = book.author;
    const newGenre = book.genre;
    const newRating = book.rating;

    if (newRating < 1 || newRating > 5) {
        alert('Invalid rating. Please use a rating between 1 and 5.');
        return;
    }

    const updatedBook = {
        title: newTitle,
        author: newAuthor,
        genre: newGenre,
        book_status: book.BookStatus, // updated from drop down
        rating: newRating,
    };

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getBooks(); //reloads books
        }
    };
    xhr.open('PUT', `${api}/${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(updatedBook));
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

                 <select class="form-select" onchange="updateBookStatus(${book.id}, this.value)">
                    <option value="reading" ${book.book_status === 'reading'}>Reading</option>
                    <option value="to-read" ${book.book_status === 'to-read'}>To-Read</option>
                    <option value="completed" ${book.book_status === 'completed'}>Completed</option>
                </select>

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
       const data = JSON.parse(xhr.responseText);
        console.log(data);
        displayBooks(data);
      }
    };
  
    xhr.open('GET', api, true);
    xhr.send();
  };

//load books on  the page
(() => {
    getBooks();
})();