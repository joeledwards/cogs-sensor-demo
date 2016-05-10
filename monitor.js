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
var vehicleUuid = 'be56ed7a-e24d-4cd5-8f3e-437c87ca31a9';

// Sends an event via the supplied Cogs client
function sendEvent(namespace, attributes, eventName) {
  return getCogsClient().sendEvent(namespace, eventName, attributes)
      .then(() => `Event '${eventName}' sent successfully.`)
      .catch((error) => `Error sending event '${eventName}': ${error}\n${error.stack}`)
}

// Door Event
function doorEvent(isOpen) {
  var eventName = `driver-door-${isOpen ? 'opened' :  'closed'}-${moment().toISOString()}`
  var attributes = {
    'vehicle-uuid': vehicleUuid,
    'driver-door-open': newOpenValue
  };

  sendEvent(namespace, attributes, eventName);
}

// Door Opened
function doorOpened() {
  console.log('Sending door open event.');
  doorEvent(true);
}

// Door Closed
function doorClosed() {
  console.log('Sending door closed event.');
  doorEvent(false);
}

// Hood Event
function hoodEvent(isOpen) {
  var eventName = `hood-${isOpen ? 'opened' :  'closed'}-${moment().toISOString()}`
  var attributes = {
    'vehicle-uuid': vehicleUuid,
    'hood-open': newOpenValue
  };

  sendEvent(namespace, attributes, eventName);
}

// Hood Opened
function hoodOpened() {
  console.log('Sending hood open event.');
  hoodEvent(true);
}

// Hood Closed
function hoodClosed() {
  console.log('Sending hood closed event.');
  hoodEvent(false);
}

// Driver door monitor.
var driverDoorOpen = false;
function doorSensorLoop() {
  pi.get(doorSensorPin)
  .then((value) => {
    var newOpenValue = value;
    var now = moment().valueOf();

    if (newOpenValue != driverDoorOpen) {
      if (driverDoorOpen) {
        doorOpened();
      } else {
        doorClosed();
      }
    }

    driverDoorOpen = newOpenValue;
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
      if (hoodOpen) {
        hoodOpened();
      } else {
        hoodClosed();
      }
    }

    hoodOpen = newOpenValue;
    //console.log(`Hood is ${hoodOpen ? 'open' : 'closed'}`);
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

