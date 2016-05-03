# Demo of Cogs message broker on sensor-driven events from a Raspberry Pi.


## Overview

This is a demo of Cogs' campaign-driven message delivery based on sensor data.
The fully-integrated example involes a Lego Technic truck with multiple
on-board sensors which are tripped by various physical interactions with the
vehicle. Changes in state trigger the delivery of a value to Cogs via the
POST /event route. Rules defined in multiple campaigns determine which (if any)
message should be delivered to subscribers.

Hood (cab) tilt sensing is the primary example. A mercury-actuated switch
monitors whether the hood is open or closed. This device is powered by
the Pi's 3.3v source (pin 1), return (ground) is pin 14, and the signal line
is pin 22 (gpio 25).

Driver-side door state (open/closed) is the second example. A coil-based magnet
detection sensor determines if the door is closed or open base on the
proximity of the door's magnet to the sensor. This device is also powered
by the Pi's 3.3v source (pin 1), return (ground) is also pin 14, and the
signal line is pin 32 (gpio 12).


## Setup Instructions

Required Items
* Raspberry Pi 2/3 B-board with Raspbian installed
* USB Wi-Fi adapter for Raspberry Pi (Panda Wireless devices work well with Linux)
* Node.js 5+ installed on Raspberry Pi
* 3-lead mercury-actuated tilt switch
* 3-lead magnetic-sensor coil
* hard-drive magnet (or one of similar strength)
* 2x 330-ohm 1/8 watt resistors

Cogswell Profile Details
* Namespace: "auto-monitor"
* Campaigns:
  * Hood Open
    * Rule: Hood Event is Last
      * Filter: newest 1 event
      * Filter: hood-open has value
      * Condition: any event exists
    * Rule: Hood Open
      * Filter: hood-open has value
      * Filter: newest 2 events
      * Condition: oldest hood-open is_false
      * Condition: newest hood-open is_true
  * Hood Closed
    * Rule: Hood Event is Last
      * Filter: newest 1 event
      * Filter: hood-open has value
      * Condition: any event exists
    * Rule: Hood Closed
      * Filter: hood-open has value
      * Filter: newest 2 events
      * Condition: oldest hood-open is_true
      * Condition: newest hood-open is_false
  * Driver Door Open
    * Rule: Door Event is Last
      * Filter: newest 1 event
      * Filter: driver-door-openn has value
      * Condition: any event exists
    * Rule: Driver Door Open
      * Filter: driver-door-open has value
      * Filter: newest 2 events
      * Condition: oldest driver-door-open is_false
      * Condition: newest driver-door-open is_true
  * Driver Door Closed
    * Rule: Door Event is Last
      * Filter: newest 1 event
      * Filter: driver-door-openn has value
      * Condition: any event exists
    * Rule: Driver Door Closed
      * Filter: driver-door-open has value
      * Filter: newest 2 events
      * Condition: oldest driver-door-open is_true
      * Condition: newest driver-door-open is_false


## Build Instructions

There is no compilation necessary for this project.

Install dependency NPM modules.
```
npm install
```

Simply run the auto-monitor daemon on the Raspberry Pi:
```
sudo node monitor.js
```

Then run the messages subscription daemon on a different system to 
confirm message deliveries:
```
node messages.js
```


## Walk-Through Video
[![Demo Walk-Through Video](https://img.youtube.com/vi/4XJyMkV2Gtg/0.jpg)](https://www.youtube.com/watch?v=4XJyMkV2Gtg)


## Authorship
Joel Edwards <joeledwards@gmail.com>
https://github.com/joeledwards/


## Attribution

NPM Modules Used
* cogs-sdk (ISC License) : https://www.npmjs.com/package/cogs-sdk
* durations (MIT License) : https://www.npmjs.com/package/durations
* lodash (MIT License) : https://www.npmjs.com/package/lodash
* log-a-log (MIT License) : https://www.npmjs.com/package/log-a-log
* moment (MIT License) : https://www.npmjs.com/package/moment
* q (MIT License) : https://www.npmjs.com/package/q
* pi-gpio (MIT License) : https://www.npmjs.com/package/pi-gpio

