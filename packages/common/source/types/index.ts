export interface MdnsDevice {
    id: string,
    name: string,
    host: string,
    ip: string,
    port: number
}

export enum DataKeys {
    webcamStatus = "webcam.status"
}

export enum WebcamStatus {
    online = "webcam.status.online",
    offline = "webcam.status.offline"
}

export enum MdnsServiceTypes {
    webcamStatus = '_webcam_status._tcp.local',
    elgatoLight = '_elg._tcp.local'
}

export interface WebcamStatusServerResponse {
    status: WebcamStatus
}
