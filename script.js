var scanned = "";
var interval;
var bookNumber;

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
				console.log("Table BOOKS dropped.");
				
				tx.executeSql('CREATE TABLE IF NOT EXISTS BOOKS (id INT NOT NULL PRIMARY KEY UNIQUE, title VARCHAR NOT NULL, edition VARCHAR, author VARCHAR NOT NULL, year VARCHAR NOT NULL, isbn VARCHAR NOT NULL, location VARCHAR NOT NULL, locNumber VARCHAR NOT NULL, availability VARCHAR NOT NULL, loaned VARCHAR NOT NULL, favourite VARCHAR,  coverurl VARCHAR)');

				console.log("Table BOOKS created.");
				
				// tx.executeSql('INSERT INTO BOOKS VALUES (ID, "TITLE", "EDITION", "AUTHORS", "YEAR", "ISBN", "LOCATION (000.00.000)", "Available", "false", "false", "IMG")');
				tx.executeSql('INSERT INTO BOOKS VALUES (1, "Pro iOS5 Tools: Xcode Instruments and Build Tools", "5th edition" ,"Alexander, Brandon", "2012", "94357852987252", "Gardens Point", "004.11.02", "Available", "false", "false", "img/ios5.jpg")');
				tx.executeSql('INSERT INTO BOOKS VALUES (2, "iOS 4 Programming Cookbook", "1st edition", "Nahavandipoor, Vandad", "2008", "9377345634634","Kelvin Grove", "005.26.84", "Available", "false", "false", "")');
				tx.executeSql('INSERT INTO BOOKS VALUES (3, "Designing Interactive Systems: People, Activities, Context, Technologies", "3th edition" ,"Benyon, David", "2009" ,"97800321116291","Gardens Point", "005.06.32", "Available", "false", "false", "")');
				tx.executeSql('INSERT INTO BOOKS VALUES (4, "Theories and practice in interaction design", "1st edition", "Bagnara, Sebastiano", "2008", "0805856188", "Gardens Point", "620.82.244", "Available", "false", "false", "")');
				tx.executeSql('INSERT INTO BOOKS VALUES (5, "Java programming: comprehensive concepts and techniques", "3st edition", "Shelly, Gary B et al.", "2006", "1418859850", "Kelvin Grove", "005.71.2262", "Available", "false", "false", "img/javaComprehensive.jpg")');
				tx.executeSql('INSERT INTO BOOKS VALUES (6, "Java programming : from problem analysis to program design", "1st edition", "Malik, D. S.", "2008", "1423901355", "Gardens Point", "005.133 JAVA 183/3", "Available", "false", "false", "img/javaprogramming.jpg")');
				tx.executeSql('INSERT INTO BOOKS VALUES (7, "Web 2.0: principles and best practices", "1st edition", "Musser, John et al.", "2007", "0596527691", "Kelvin Grove", "381.142.12", "Available", "false", "false", "img/web2.jpg")');
				tx.executeSql('INSERT INTO BOOKS VALUES (8, "Economics for today", "4th edition", "Layton, Allan P.", "2011", "9780170190855", "Gardens Point", "330 871/4", "Available", "false", "false", "img/economicstoday.jpg")');
				
				console.log("4 items inserted into table BOOKS");
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

// Empties list with given #listid
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

// // Search page
// $('#searchPage').live( 'pageinit',function(event) {
// 	console.log("Search page init");
// });


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

$('#loanedBooksPage').live('pageinit', function(event) {
	console.log("Listing all loaned books ...");
	
	db.transaction(function (tx) {
		console.log("Transaction started.");

		tx.executeSql('SELECT * FROM BOOKS WHERE (loaned LIKE ?)' , ["true"], function (tx, results) {
			console.log("SQL Executed");
			
			var books = results.rows;
			var book;
			var len = books.length;

			console.log(len + " rows found. Adding to list: ");
			
			for (i = 0; i < len; i++) {
				book = results.rows.item(i);
				$("ul#loanedBooksListing").append("<li><a class='bookLink' href='book.html?id=" + book.id + "' name='" + book.id + "'>\n"
								+ "<h3 class='listingBookTitle'>" + book.title + "</h3>\n"
								+ "<div><br/>"
								+ "<p class='author'>by "+ book.author + "</p>"
								+ "<p class='bookYear>"+ book.year +"</p><p class='campusLocation'>"+ book.location +"</p>"
								+ "</div>"
								+ "</a></li>");
				console.log("Appending: " + results.rows.item(i).title);
			}

			console.log("Refreshing list.");
			$("#loanedBooksListing").listview("refresh");
			
		}, null); // execute sql
	}); // transaction
});


$(".bookLink").live('click', function() {
	bookNumber = this.name;
});

// $("#favouriteBook").live('click', function() {
// 	
// });

// Book information page
$('#bookInfoPage').live('pageinit' ,function(event) {
	clearInterval(interval);
	
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
		bookNumber = id;
	}
	

	var loaned = document.getElementById("loanSuccess");

	if ( scanned == "true") { // document.referrer.indexOf('scanMock.html') != -1) {
		scanned = "false";
		loaned.style.display = '';
		
		/*
		// Todays date
		var sDate=new Date();
	    var sDat=sDate.getDate();
	    var sMon=sDate.getMonth();
	    var sYear=sDate.getFullYear();
	    var startDate = sDat+"/"+sMon+"/"+sYear;

		// + one month
		var eDate=new Date();
	    var eDat=eDate.getDate();
	    var eMon=eDate.getMonth() + 1;
	    var eYear=eDate.getFullYear();
	
		// To make sure days in calendar don't exist
		if ((eDat == 31 && eMon == 4 || eMon == 6 || eMon == 9 || eMon == 11) || (eDat > 28 && eMon == 2 && eYear % 4) ) {
			eDat = 1;
			eMon++;
		}
		if (eMon == 13) {
			eMon = 1
			eYear++;
		}
		
		var endDate = eDat+"/"+eMon+"/"+eYear;
		*/
		
		db.transaction(function (tx) {
			tx.executeSql('UPDATE BOOKS SET loaned="true" WHERE id = ?',[id]);
			console.log("Book with id " + id + " was loaned.");
		}); // DB transaction	
	}
	else {
		loaned.style.display = 'none';
	}
	
	console.log("Fetching book with id = " + id);
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM BOOKS WHERE id = ?', [id], function (tx, result) {			
			var book = result.rows.item(0);

			document.querySelector('.bookTitle').innerHTML = book.title;
			document.querySelector('.bookAuthor').innerHTML = book.author;
			document.querySelector('.bookEditionYear').innerHTML = book.edition + ", " + book.year;
			document.querySelector('.bookLocation').innerHTML = book.location + " ( " + book.locNumber + " )";
			document.querySelector('.bookISBN').innerHTML = "ISBN " + book.isbn;



			var availability = document.getElementById("bookInfoAvailability");
			var loanButton = document.getElementById("loanButton");

			if (book.loaned == "true") {
				availability.style.display = 'none';
				loanButton.style.display = 'none';
			} else {
				availability.style.display = '';
				document.querySelector('.bookAvailability').innerHTML = book.availability;
				loanButton.style.display = '';
			}

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
	window.scanned = "true";
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

			$.mobile.changePage("book.html?id=" + bookNumber + "&scanned=true");
		}

    };
	interval = setInterval(changeImage, delayInSeconds * 100);
});


