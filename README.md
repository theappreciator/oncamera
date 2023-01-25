# OnCamera - an Elgato Key Light Automator

Detects webcam on/off events, triggering Elgato Key Lights to turn on/eff.  


## How does it work?
1. Computer with webcam has a listener to detect webcam on/off events.  In this case we are using Oversight on a Macbook Pro.
1. An express server is running locally to both set and get current status.
1. When webcam on/off events are detected a shell script is fired to update the local status through local express server api.
1. A remote machine on an interval requests the status from the api. 
1. If status == online then turn on lights.
1. If status == offline then turn off lights


## Includes
- `Status cli` - for reacting to local webcam on/off events to set current status locally
- `Status api` - for exposing local status to remote watchers
- `Watcher cli` - for watching for webcam on/off events from remote machines


## Usage

### status-cli

### status-api

### watcher-cli
