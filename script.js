


if (!window.openDatabase) {  
   	console.log('Databases are not supported in this browser.');
} else {
	var db;
	createDB();
}

function initDB() {
	try {
		db = openDatabase('mydb', '1.0', 'Library Database', 2 * 1024 * 1024);
		console.log("Database open.");
	} catch(e) {
		if ( e == 2) {
			console.log("Invalid database version.");
		}
	}
}
function createDB() {
	try {
		if (!window.openDatabase) {  
	    	console.log('Databases are not supported in this browser.');
		} else {
			initDB();
			
			db.transaction(function (tx) {
//				tx.executeSql('DROP TABLE BOOKS');
//				console.log("Table BOOKS dropped.");
				
				tx.executeSql('CREATE TABLE IF NOT EXISTS BOOKS (id INT NOT NULL PRIMARY KEY UNIQUE, title, edition, author, isbn ,location, availability, coverurl)');
				console.log("Table BOOKS created.");
				
				tx.executeSql('INSERT INTO BOOKS VALUES (1, "Pro iOS5 Tools: Xcode Instruments and Build Tools", "5th edition" ,"Alexander, Brandon", "94357852987252", "Gardens Point (004.11.02)", "Available", "img/ios5.jpg")');
				tx.executeSql('INSERT INTO BOOKS VALUES (2, "iOS 4 Programming Cookbook", "1st edition", "Nahavandipoor, Vandad", "9377345634634","Kelvin Grove (005.26.84)", "Available", "")');
				tx.executeSql('INSERT INTO BOOKS VALUES (3, "Designing Interactive Systems: People, Activities, Context, Technologies", "3th edition" ,"Benyon, David", "97800321116291","Gardens Point (005.06.32)", "Available", "")');
				tx.executeSql('INSERT INTO BOOKS VALUES (4, "Theories and practice in interaction design", "1st edition", "Bagnara, Sebastiano", "0805856188", "Gardens Point (620.82.244)", "Available", "")');
				console.log("4 items inserted into table BOOKS");

				// tx.executeSql('CREATE TABLE IF NOT EXISTS loaned (id, bookId, loanDate, endDate)');
				// 
				// tx.executeSql('CREATE TABLE IF NOT EXISTS loaned (id, bookId)');
			
			}); // DB transaction
			
		} // end else
	} catch(e) {  
        if (e == 2) {  
            // Version number mismatch.  
           	console.log("Invalid database version.");  
        } else {  
            console.log("Unknown error "+e+".");  
        }

       	return false;
	} // catch
	
}

// empties list with given #listid
function emptyList(listId) {
	// Removing all elements in list
	console.log("Removing all elements in list " + listId);
	var list = listId + " li";

	$(list).each(
	  function() {
	    	var elem = $(this);
	    	elem.remove();
	  	}
	);
	
	console.log("Elements removed from list " + listId);
}

// Search page
$('#searchPage').live( 'pageinit',function(event) {
	console.log("Search page init");
});


$("#search").live( 'submit', function() {
	
	console.log("Searching ...");
	var searchValue = document.getElementById("searchBooksField").value;

	emptyList("#bookSearchListing");

	console.log("Fetching all books where title = " + searchValue);

	db.transaction(function (tx) {
		console.log("Executing ...");
		tx.executeSql('SELECT * FROM BOOKS WHERE (title LIKE ?)', ["%" + searchValue + "%"], function (tx, results) {
			console.log("Executed!");
			var books = results.rows;
			var book;
			var len = books.length;

			console.log(len + " rows found. Adding to list: ");
			
			for (i = 0; i < len; i++) {
				book = results.rows.item(i);
				$("ul").append("<li><a class='bookLink' href='book.html?id=" + book.id + "' name='" + book.id + "'>\n"
								+ "<h3 class='listingBookTitle'>" + book.title + "</h3>\n"
								+ "<div><br/>"
								+ "<p class='author'>" + book.author + "</p>"
								+ "<p class='listAvailability'>" + book.availability + "</p>"
								+ "</div>"
								+ "</a></li>");
				console.log("Appending: " + results.rows.item(i).title);
			}

			console.log("Refreshing list.");
			$("#bookSearchListing").listview("refresh");
			
	 	}, null); // execute sql
	}); // transaction
}); // submit

var bookNumber;
$(".bookLink").live('click', function() {
	bookNumber = this.name;
});

// Book information page
$('#bookInfoPage').live('pageinit' ,function(event) {

	var $_GET = {};
	document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
	    function decode(s) {
	        return decodeURIComponent(s.split("+").join(" "));
	    }
	
	    $_GET[decode(arguments[1])] = decode(arguments[2]);
	});
	
	
	// If page refreshed manually the search will fail
	var id;
	
	if (isNaN($_GET["id"])) {
	
		id = parseInt(bookNumber);
	} else {
		id = parseInt($_GET["id"]);
	}
	
	console.log("Fetching book with id = " + id);

	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM BOOKS WHERE id = ?', [id], function (tx, result) {

			var book = result.rows.item(0);

			document.querySelector('.bookTitle').innerHTML = book.title;
			document.querySelector('.bookEdition').innerHTML = book.edition;
			document.querySelector('.bookAuthor').innerHTML = book.author;
			document.querySelector('.bookLocation').innerHTML = book.location;
			document.querySelector('.bookISBN').innerHTML = "ISBN " + book.isbn;
			document.querySelector('.bookAvailability').innerHTML = book.availability;

			var cover = document.getElementById("bookInfoImage");
			if(book.coverurl){
				cover.src = book.coverurl;
			} else {
				cover.src = "img/defaultCover.jpg";
			}

		}, null);
	}); // transaction
});

// Scan animation
$('#scanPage').live( 'pageinit',function(event){
	
	var rotator = document.getElementById("scanImg1"); // change to match image ID
	var imageDir = 'img/scan/';						   // change to match images folder
	var delayInSeconds = 5;                            // set number of seconds delay
	// list image names
	var images = ["scan1.png", "scan2.png", "scan3.png"];
    
	// don't change below this line
	var num = 0;
    
	var currImg = 0;
	
	var changeImage = function() {
		
		if (num < 3) {
	    	var len = images.length;
        	rotator.src = imageDir + images[num++];
			currImg++;
        }
		else {
			window.location = "loanConfirm.html"
		}

    };
	setInterval(changeImage, delayInSeconds * 150);
});
