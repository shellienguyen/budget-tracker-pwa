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

   // Create an object store (table) called 'new_transaction' and set it to auto
   // incrementing primary key of sorts
   db.createObjectStore( 'new_transaction', { autoIncrement: true });
};