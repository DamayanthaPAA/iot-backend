const sqlite3 = require('sqlite3').verbose();

// Open the SQLite database
const db = new sqlite3.Database('./parking_data.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Query to select all data from the parking_slots table
db.all('SELECT * FROM parking_slots', [], (err, rows) => {
    if (err) {
        console.error('Error retrieving data:', err.message);
    } else {
        // Log the results to the console
        console.log('All Parking Slot Data:');
        console.log(rows); // `rows` is an array of objects representing each row
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    } else {
        console.log('SQLite database closed.');
    }
});
