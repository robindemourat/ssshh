// This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;


export default function init(dbName = 'my-database', callback) {

    // Open (or create) the database
    const open = indexedDB.open(dbName, 1);

    // Create the schema
    open.onupgradeneeded = function() {
        console.log('upgrade needed');
        const db = open.result;
        const store = db.createObjectStore("ItemsObjectStore", {keyPath: "id"});
        return store;
        // const index = store.createIndex("IdIndex", ["id"]);
    };

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        // console.log('db is a success', db);

        const tx = db.transaction("ItemsObjectStore", "readwrite");
        const store = tx.objectStore("ItemsObjectStore");
        // const index = store.index("IdIndex");

        const getAll = store.getAll();

        tx.oncomplete = () => {
            callback('init', getAll.result, db);
        }
    }

    return open;
}