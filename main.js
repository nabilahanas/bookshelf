const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete,
    };
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    const textTitle = document.createElement('h2');
    textTitle.classList.add('item-list');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = author;

    const textYear = document.createElement('p');
    textYear.innerText = year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.append(textContainer);

    const article = document.createElement('article');
    article.classList.add('book_item');
    article.append(textContainer);
    article.setAttribute('id', `book-${id}`);

    if (isComplete) {
        const unReadButton = document.createElement('button');
        unReadButton.classList.add('green');
        unReadButton.innerText = 'Belum selesai dibaca';
        unReadButton.addEventListener('click', function () {
            undoBookToUnread(id);
        });

        const trashButtonRead = document.createElement('button');
        trashButtonRead.classList.add('red');
        trashButtonRead.innerText = 'Hapus buku';
        trashButtonRead.addEventListener('click', function () {
            removeBook(id);
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("action");
        buttonContainer.append(unReadButton, trashButtonRead);

        article.append(buttonContainer);

    } else {
        const readButton = document.createElement('button');
        readButton.classList.add('green');
        readButton.innerText = 'Selesai dibaca';
        readButton.addEventListener('click', function () {
            addBookToRead(id);
        });

        const trashButtonUnread = document.createElement("button");
        trashButtonUnread.classList.add("red");
        trashButtonUnread.innerText = "Hapus buku";
        trashButtonUnread.addEventListener("click", function () {
            removeBook(id);
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("action");
        buttonContainer.append(readButton, trashButtonUnread);

        article.append(buttonContainer);
    }

    return article;
}

function addBook() {
    const titleBook = document.getElementById('inputBookTitle').value;
    const authorBook = document.getElementById('inputBookAuthor').value;
    const yearBook = document.getElementById('inputBookYear').value;

    const generatedID = generateId();
    const isCheck = document.getElementById('inputBookIsComplete').checked;

    if (isCheck) {
        const bookObject = generateBookObject(
            generatedID,
            titleBook,
            authorBook,
            yearBook,
            true
        );
        books.push(bookObject);
    } else {
        const bookObject = generateBookObject(
            generatedID,
            titleBook,
            authorBook,
            yearBook,
            false
        );
        books.push(bookObject);
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToRead(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookToUnread(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {

    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, () => {
    console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, function () {
    const completeBookshelfList = document.getElementById('completeBookshelfList');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');

    completeBookshelfList.innerHTML = '';
    incompleteBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completeBookshelfList.append(bookElement);
        } else {
            incompleteBookshelfList.append(bookElement);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const findBook = document.getElementById("searchBook");
    const findTitle = document.querySelector("#searchBookTitle");

    findBook.addEventListener("submit", function (e) {
        e.preventDefault();

        const titleValue = findTitle.value.toLowerCase().trim();

        const findValue = books.filter((book) => {
            return (
                book.title.toLowerCase().includes(titleValue) ||
                book.author.toLowerCase().includes(titleValue) ||
                book.year.toString().includes(titleValue)
            );
        });

        search(findValue);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function search(value) {
    const completeBookshelfList = document.getElementById("completeBookshelfList");
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");

    completeBookshelfList.innerHTML = "";
    incompleteBookshelfList.innerHTML = "";

    for (const book of value) {
        const bookItem = makeBook(book);

        if (book.isComplete) {
            completeBookshelfList.append(bookItem);
        } else {
            incompleteBookshelfList.append(bookItem);
        }
    }
}
