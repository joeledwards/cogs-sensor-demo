require('log-a-log');

const _ = require('lodash');
const Q = require('q');
const pi = require('./pi');
const moment = require('moment');
const durations = require('durations');
const cogs = require('cogs-sdk');

var doorSensorPin = 32; // Signal pin for magnetic switch (on == true, off = false)
var hoodSensorPin = 22; // Signal pin for mercury switch (on == false, off = true)

var stop = false;
process.on('SIGINT', () => stop = true);

// Cogs API client
var cogsClient;
function getCogsClient() {
  if (cogsClient == null) {
    return cogs.api.getClient('cogs.json')
        .then((client) => {
          cogsClient = client;
          return cogsClient;
        });
  }
  else {
    return Q(cogsClient);
  }
}

var namespace = 'auto-monitor';
var vehicleUuid = 'deadbeef-dead-beef-dead-beefdeadbeef';

// Driver door monitor.
var driverDoorOpen = false;
function doorSensorLoop() {
  pi.get(doorSensorPin)
  .then((value) => {
    var newOpenValue = value;
    var now = moment().valueOf();

    if (newOpenValue != driverDoorOpen) {
      lastStatusEvent = now;
      console.log(`Sending door status update event: driver-door-open=${newOpenValue}`);
      getCogsClient().then((client) => {
        var eventName = `driver-door-${newOpenValue ? 'opened' :  'closed'}-${moment().toISOString()}`
        var attributes = {
          'vehicle-uuid': vehicleUuid,
          'driver-door-open': newOpenValue
        };

        client.sendEvent(namespace, eventName, attributes)
        .then(() => console.log(`Sent status update event.`))
        .catch((error) => console.error(`Error deliverying status update event: ${error}\n${error.stack}`));
      });
    }

    driverDoorOpen = newOpenValue;
    console.log(`Driver door is ${driverDoorOpen ? 'open' : 'closed'}`);
  })
  .catch((error) => {
    console.error(`Error reading pin ${doorSensorPin}: ${error}\n${error.stack}`);
  })
  .finally(() => {
    if (stop === true) {
      pi.shutdown().then(() => process.exit(0));
    } else {
      setTimeout(() => doorSensorLoop(), 500);
    }
  })
}

// Hood monitor.
var hoodOpen = true;
function hoodSensorLoop() {
  pi.get(hoodSensorPin)
  .then((value) => {
    var newOpenValue = !value;
    var now = moment().valueOf();

    if (newOpenValue != hoodOpen) {
      lastStatusEvent = now;
      console.log(`Sending hood status update event: hood-open=${newOpenValue}`);
      getCogsClient().then((client) => {
        var eventName = `hood-${newOpenValue ? 'opened' :  'closed'}-${moment().toISOString()}`
        var attributes = {
          'vehicle-uuid': vehicleUuid,
          'hood-open': newOpenValue
        };

        client.sendEvent(namespace, eventName, attributes)
        .then(() => console.log(`Sent status update event.`))
        .catch((error) => console.error(`Error deliverying status update event: ${error}\n${error.stack}`));
      });
    }

    hoodOpen = newOpenValue;
    console.log(`Hood is ${hoodOpen ? 'open' : 'closed'}`);
  })
  .catch((error) => {
    console.error(`Error reading pin ${hoodSensorPin}: ${error}\n${error.stack}`);
  })
  .finally(() => {
    if (stop === true) {
      pi.shutdown().then(() => process.exit(0));
    } else {
      setTimeout(() => hoodSensorLoop(), 500);
    }
  })
}

// Program entry point.
function monitor() {
  hoodSensorLoop();
  doorSensorLoop();
}

monitor();

