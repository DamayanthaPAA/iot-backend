const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const mqtt = require('mqtt');
const url = 'mqtt://test.mosquitto.org:1883';
const clientId = 'adpa_gateway-controller';
const topic = 'Karelia_IoT_Project_Dec_2024';

const options = {
    clientId: clientId,
    clean: true
};

const mqttClient = mqtt.connect(url, options);

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
    // Broadcast the message to all WebSocket clients
    wss.clients.forEach(client => {
        // WebSockets allow both the client and server to send and receive 
        // messages in 
        // real time without needing to repeatedly establish a connection.
        if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
        }
    });
});

mqttClient.on('error', function (error) {
    console.error('MQTT connection error:', error);
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
