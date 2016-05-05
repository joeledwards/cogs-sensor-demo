require('log-a-log');

const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
const durations = require('durations');
const cogs = require('cogs-sdk');
const pi = require('./pi');

var namespace = 'auto-monitor';
var vehicleUuid = 'deadbeef-dead-beef-dead-beefdeadbeef';
var attributes = {
  'vehicle-uuid': vehicleUuid
};

var cogsClient;
cogs.api.getClient('cogs.json')
.then((client) => {
  var d = Q.defer();
  cogsClient = client;

  console.log("Subscribing to topic...");

  cogsClient.subscribe(namespace, attributes)
  .then((ws) => {
    console.log("Subscription established.");

    ws.on('error', (error) => console.error(`Error with WebSocket connection: ${error}\n${error.stack}`));
    ws.on('open', () => console.log(`WebSocket connection established.`));
    ws.on('message', (json) => {
      var message = JSON.parse(json);
      //console.log(`raw message: ${json}`)
      console.log(`message: ${message.notification_msg}`)

      var doorOpen = message.forwarded_event.attributes['driver-door-open'];
      if (doorOpen === true) {
        console.log('Door light on.');
        pi.on(16).catch((error) => console.error(error));
      } else if (doorOpen === false) {
        console.log('Door light off.');
        pi.off(16).catch((error) => console.error(error));
      }

      var hoodOpen = message.forwarded_event.attributes['hood-open'];
      if (hoodOpen === true) {
        console.log('Hood light on.');
        pi.on(37).catch((error) => console.error(error));
      } else if (hoodOpen === false) {
        console.log('Hood light off.');
        pi.off(37).catch((error) => console.error(error));
      }
    });
    //ws.on('acked', (messageId) => console.log(`message '${messageId}' acknowledged`));
    ws.on('close', () => console.log(`closed`));
    ws.on('reconnect', () => console.log(`WebSocket reconnected.`));
  });

  return d.promise;
})
.catch((error) => {
  console.error(`Error with Cogs connection: ${error}\n${error.stack}`);
})
.finally(() => {
  console.log("Done.");
});

