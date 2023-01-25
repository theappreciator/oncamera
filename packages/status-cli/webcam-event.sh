#!/bin/zsh

LISTENER_HOST="localhost"
LISTENER_PORT="9124"
LISTENER_URL="http://localhost:9124/api/webcam/status"
WEBCAM_STATUS_ONLINE="webcam.status.online"
WEBCAM_STATUS_OFFLINE="webcam.status.offline"

incoming_device_arg="$1"
incoming_device_value="$2"
incoming_event_arg="$3"
incoming_event_value="$4"
incoming_process_arg="$5"
incoming_process_value="$6"

echo "$incoming_event_value"
echo "${WEBCAM_STATUS_ONLINE} ${LISTENER_URL}"
if [ "$incoming_device_value" = "camera" -a "$incoming_event_value" = "on" ]
then
    curl -X POST -d status=${WEBCAM_STATUS_ONLINE} http://localhost:9124/api/webcam/status
elif [ "$incoming_device_value" = "camera" -a "$incoming_event_value" = "off" ]
then
    curl -X POST -d status=${WEBCAM_STATUS_OFFLINE} http://localhost:9124/api/webcam/status
fi