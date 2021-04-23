// Create the variable to hold db connection
let db;


/*
Establish a connection to IndexedDB database called 'budget_tracker' and
set it to version 1.  This is an event listener to the db where
indexedDB is a global variable
*/
const request = indexedDB.open( 'budget_tracker', 1 );


/*
This event listener will emit if the database version changes
(nonexistant to version 1, v1 to v2, etc.)

This onupgradeneeded event will emit the first time this code is run and
creates the budget_tracker object store. The event won't run again unless the
database is deleted from the browser or the version number is changed in
the .open() method to a value of 2, indicating that the database needs an update.
*/
request.onupgradeneeded = function( event ) {
   // Save a reference to the database
   const db = event.target.result;

   // Create an object store (table) called 'new_budget_item' and set it to auto
   // incrementing primary key of sorts
   db.createObjectStore( 'new_budget_item', { autoIncrement: true });
};


// Upon a successful db creation/connection
request.onsuccess = function( event ) {
   /*
   When db is successfully created with its object store (from onupgradedneeded
   event above) or simply established a connection, save reference to db in
   the global variable
   */
   db = event.target.result;

   // If app is online, run uploadBudgetItems() function to send all indexedDB
   // data to the API
   if ( navigator.onLine ) {
      uploadBudgetItems();
   };
};


request.onerror = function( event ) {
   // Log error here
   console.log( event.target.errorCode );
};


/*
This function will be executed if an attempt to submit a new budget item is made
and there's no internet connection.  This saveBudgetItem() function will be used
in the index.js file's form submission function (sendTransaction function) if the
fetch() function's .catch() method is executed, since the .catch() method is
executed on netowrk failure.
*/
function saveBudgetItem( record ) {

   // Open a new transaction with the database with read and write permissions
   // Kind of like a temporary connection to the db
   const budgetItem = db.transaction( [ 'new_budget_item' ], 'readwrite' );

  // Access the object store for 'new_budget_item'
   const budgetObjectStore = budgetItem.objectStore( 'new_budget_item' );

   // Add record to the store with the add method
   budgetObjectStore.add( record );
};


function uploadBudgetItems() {
   // Open a transaction on the db to read the data
   const transaction = db.transaction([ 'new_budget_item' ], 'readWrite' );

   // Access the object store
   const budgetObjectStore = transaction.objectStore( 'new_budget_item' );

   // Get all records from store and set to a variable.
   // The .getAll() method is an asynchronous function that we
   // have to attach an event handler to in order to retrieve the data
   const getAll = budgetObjectStore.getAll();

   getAll.onsuccess = function() {
      // if there was data in indexedDb's store, let's send it to the api server
      if ( getAll.result.length > 0 ) {
         fetch( '/api/transaction', {
            method: 'POST',
            body: JSON.stringify( getAll.result ),
            headers: {
               Accept: 'application/json, text/plain, */*',
               'Content-Type': 'application/json'
            }
         })
         .then( response => response.json() )
         .then( serverResponse => {
            if (serverResponse.message ) {
               throw new Error( serverResponse );
            };

            // Open one more transaction
            const transaction = db.transaction([ 'new_budget_item' ], 'readWrite' );

            // Access the new_budget_item object store
            const budgetObjectStore = transaction.objectStore( 'new_budget_item' );

            // Clear all the items in the object store
            budgetObjectStore.clear();

            alert( 'All saved budget items have been submitted' );
         })
         .catch( err => {
            console.log( err );
         })
      };
   };
};


// Listen for when the app goes back online
window.addEventListener( 'online', uploadBudgetItems );