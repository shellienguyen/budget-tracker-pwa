const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'v01';
const CACHE_NAME = APP_PREFIX + VERSION;


const FILES_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/idb.js',
  './js/index.js',
  './manifest.json',
  './icons/icon-512x512.png',
  './icons/icon-384x384.png',
  './icons/icon-192x192.png',
  './icons/icon-152x152.png',
  './icons/icon-144x144.png',
  './icons/icon-128x128.png',
  './icons/icon-96x96.png',
  './icons/icon-72x72.png'
];

/*
Use self instead of window.addEventListener because service workers run
before the window object has even been created. Hence, use the self keyword
to instantiate listeners on the service worker. The context of self here refers
to the service worker object.
*/
self.addEventListener( 'install', function ( e ) {
   e.waitUntil(
      caches.open( CACHE_NAME ).then( function ( cache ) {
         console.log( 'installing cache : ' + CACHE_NAME );
         return cache.addAll( FILES_TO_CACHE );
      })
   );
});


/*
.keys() returns an array of all cache names, which is being called keyList.
keyList is a parameter that contains all cache names under <username>.github.io.
Because many sites may be hosted from the same URL, caches that have the app
prefix should be filtered out. Capture the ones that have that prefix,
stored in APP_PREFIX, and save them to an array called cacheKeeplist using
the .filter() method.
*/
self.addEventListener( 'activate', function ( e ) {
   e.waitUntil(
      caches.keys().then( function ( keyList ) {
         let cacheKeeplist = keyList.filter( function ( key ) {
            return key.indexOf( APP_PREFIX );
         });
         
         /*
         Remember that CACHE_NAME was setup as a global constant to
         help keep track of which cache to use.
         */
         cacheKeeplist.push( CACHE_NAME );

         /*
         This last bit of the activate listener returns a Promise that
         resolves once all old versions of the cache have been deleted.
         */
         return Promise.all( keyList.map( function ( key, i ) {
            if ( cacheKeeplist.indexOf( key ) === -1 ) {
               console.log( 'deleting cache : ' + keyList[ i ] );
               return caches.delete( keyList[ i ] );
            };
         }));
      })
   );
});


/*
Retrieve info from the cache
Here, we listen for the fetch event, log the URL of the requested resource,
and then begin to define how we will respond to the request.
*/
self.addEventListener( 'fetch', function ( e ) {
   console.log( 'fetch request : ' + e.request.url );

   // Use respondWith to intercept the fetch request
   e.respondWith(
      /*
      Check to see if the request is stored in the cache or not. If it is
      stored in the cache, e.respondWith will deliver the resource directly
      from the cache; otherwise the resource will be retrieved normally.
      Use .match() to determine if the resource already exists in caches.
      */
      caches.match( e.request ).then( function ( request ) {
         // If it does, we'll log the URL to the console with a message and then
         // return the cached resource.
         if ( request ) {
            console.log('responding with cache : ' + e.request.url );
            return request;
         }
         // If the resource is not in caches, we allow the resource to be retrieved
         // from the online network as usual
         else {
            console.log( 'file is not cached, fetching : ' + e.request.url );
            return fetch( e.request );
         };
      })
   );
});