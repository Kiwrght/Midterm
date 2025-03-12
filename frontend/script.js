const api = 'http://localhost:8000/books';


//add book function
const addBook = () =>{
    const title = prompt('Enter book title')
    const author = prompt('Enter book author')
    const genre = prompt('Enter book gere')
    const book_status = prompt('Enter book status')
    const rating = parseInt(prompt('Enter book rating(1-5): '), 10)

    if (title && author && gere && bookStatus && rating) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                getBooks(); //reloads books
            }
        };

        xhr.open('POST', api, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify({ title, author, genre, bookStatus, rating }));
    } else {
        alert('Invalid input. Please fill all fields and use a rating between 1 and 5.');
      
    }
};

//delete book function
const deleteBook = (id) => {
    if(confirm('Are you sure you want to delete this book?')){
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                getBooks(); //reloads books
            }
        };

        xhr.open('DELETE', `${api}/${id}`, true);
        xhr.send();
    }
};

//update books status function
const updateBookStatus = (bookId, newStatus) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            getBooks(); //reloads books
        }
    };
}

//Edit existing book function
const editBook = (id) => {
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
        book-status: book.BookStatus, // updated from drop down
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



//load books on  the page
(() => {
    getBooks();
})();