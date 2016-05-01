# Demo of Cogs message broker on events from sensors attached to a Raspberry Pi.

## Overview

This is a demo of Cogs' campaign-driven message delivery based on sensor data.
The fully-integrated example involes a Lego Technic truck with multiple
on-board sensors which tripped by various physical interactions with the
vehicle. Changes in state trigger the delivery of a value to Cogs via the
POST /event route. Rules defined in multiple campaigns determine which (if any)
message should be delivered to subscribers.

Hood (cab) tilt sensing is the primary example. A mercury-actuated switch
monitors whether the hood is open or closed.

Driver-side door state (open/closed) is the secondary example. A magnetic
field detection sensor determines if the door is closed or open base on the
proximity of the door's magnet to the sensor. 

## Setup Instructions

Required Items
* Raspberry Pi 2/3 B-board with Raspbian installed
* USB Wi-Fi adapter for Raspberry Pi (Panda Wireless devices work well with Linux)
* Node.js 5+ installed on Raspberry Pi
* 3-lead mercury-actuated tilt switch
* 3-lead magnetic-field detector
* 3x 220-ohm 1/8 watt resistors

Cogswell Profile Details
* Namespace: "auto-monitor"
* Campaigns:
** Hood Open 
*** Filter: newest 2 events
*** Condition: oldest hood-open is_false
*** Condition: newest hood-open is_true
** Hood Closed
*** Filter: newest 2 events
*** Condition: oldest hood-open is_true
*** Condition: newest hood-open is_false
** Driver Door Open
*** Filter: newest 2 events
*** Condition: oldest driver-door-open is_false
*** Condition: newest driver-door-open is_true
** Driver Door Closed
*** Filter: newest 2 events
*** Condition: oldest driver-door-open is_true
*** Condition: newest driver-door-open is_false

## Build Instructions

There is no compilation necessary for this project. Simply run the
auto-monitor daemon:

```
node monitor.js
```


## Authorship
Joel Edwards <joeledwards@gmail.com>
https://github.com/joeledwards/
