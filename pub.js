// Publisher: single board computer 1 - SBC-001
// having simulated (random) temperature and illumination sensors

const url = 'mqtt://test.mosquitto.org:1883';
const username = 'IoT-GUEST'
const password = 'Gj@ci85TjdJvzMZ'
const clientid = 'IoT-PTest001'
const topic = 'Karelia_IoT_Project_Dec_2024';
const timerDelay = 5000

const mqtt = require('mqtt')

const options = {
    clientId: clientid,
    clean: true
}
  // Function to generate random MAC address
  const generateRandomMac = () => {
    // Generate a random hex string for the last part of MAC
    const randomHex = Math.floor(Math.random() * 9) + 1; // 1-9
    return `E4:6D:78:1B:5A:E${randomHex}`;
  };

  // Function to generate random distance between 0 and 100
  const generateRandomDistance = () => {
    return Number((Math.random() * 100).toFixed(2));
  };
var client = mqtt.connect( url, options )
// {"mac":"E4:6D:78:1B:5A:E0", "distance":191.50, "unit":"cm"}
client.on('connect', () => {
    console.log("Connection established.")
    setInterval(
        () => {
            const data = {
                mac: generateRandomMac(),
                distance: generateRandomDistance(),
                unit: "cm"
                
            }
            const frame = JSON.stringify( data )
            client.publish( topic, frame )
            console.log("Sent " + frame)
        }
    , timerDelay )
})
