const WebSocket = require('ws');
const express = require('express');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose(); // SQLite module

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const mqttUrl = 'mqtt://test.mosquitto.org:1883';
const clientId = 'adpa_gateway-controller';
const topic = 'Karelia_IoT_Project_Dec_2024';

const mqttOptions = {
    clientId: clientId,
    clean: true
};

const mqttClient = mqtt.connect(mqttUrl, mqttOptions);

// Initialize SQLite database
const db = new sqlite3.Database('./parking_data.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create the table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS parking_slots (
                mac TEXT PRIMARY KEY,
                distance REAL,
                unit TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Parking slots table ready.');
            }
        });
    }
});

// WebSocket connection event
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
});

// MQTT subscription and forwarding to WebSocket
mqttClient.on('connect', function () {
    console.log("Subscribing to topic " + topic);
    mqttClient.subscribe(topic);
});

mqttClient.on('message', function (receivedTopic, message) {
    console.log('Received message on topic:', receivedTopic);
    console.log('Message:', message.toString());

    const data = JSON.parse(message.toString()); // Parse the message
    const { mac, distance, unit } = data;

    // Insert or update data in SQLite
    db.run(`
        INSERT INTO parking_slots (mac, distance, unit)
        VALUES (?, ?, ?)
        ON CONFLICT(mac) DO UPDATE SET
        distance = excluded.distance,
        unit = excluded.unit
    `, [mac, distance, unit], (err) => {
        if (err) {
            console.error('Error inserting/updating database:', err.message);
        } else {
            console.log(`Data saved/updated for MAC: ${mac}`);
        }
    });

    // Broadcast the message to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
        }
    });
});

mqttClient.on('error', function (error) {
    console.error('MQTT connection error:', error);
});

// Gracefully close the SQLite database on process exit
process.on('SIGINT', () => {
    console.log('Closing SQLite database.');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('SQLite database closed.');
        }
        process.exit(0);
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
