require('log-a-log');

const _ = require('lodash');
const Q = require('q');
const pi = require('./pi');
const moment = require('moment');
const durations = require('durations');
const cogs = require('cogs-sdk');

var pin = 22; // Signal pin for mercury switch (on == false, off = true)

var stop = false;
process.on('SIGINT', () => stop = true);

var hoodOpen = true;
function hoodSensorLoop() {
  pi.get(pin)
  .then((value) => {
    var newOpenValue = !value;

    if (newOpenValue != hoodOpen) {
      console.log("Sending hood status update event: hood-open=${newOpenValue}");
      // TODO: send update
    }

    hoodOpen = newOpenValue;
    console.log(`Hood is ${hoodOpen ? 'open' : 'closed'}`);
  })
  .catch((error) => {
    console.error(`Error reading pin ${pin}: ${error}\n${error.stack}`);
  })
  .finally(() => {
    if (stop === true) {
      pi.shutdown().then(() => process.exit(0));
    } else {
      setTimeout(() => hoodSensorLoop(), 100);
    }
  })
}

// Program entry point.
function monitor() {
  hoodSensorLoop();
}

monitor();

