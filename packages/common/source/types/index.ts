export interface MdnsDevice {
    id: string,
    name: string,
    host: string,
    ip: string,
    port: number
}
  
export interface MdnsRecordA {
    name?: string,
    type: 'A',
    ttl?: number,
    class?: string,
    flush?: boolean,
    data?: string
}

export interface MdnsRecordSrv {
    name?: string,
    type: 'SRV',
    ttl?: number,
    class?: string,
    flush?: boolean,
    data?: MdnsRecordSrvData
}

export interface MdnsRecordSrvData {
    priority?: number,
    weight?: number,
    port?: number,
    target?: string
}

export enum WebcamStatus {
    online = "webcam.status.online",
    offline = "webcam.status.offline"
}

export enum MdnsServiceTypes {
    webcamStatus = '_webcam_status._tcp.local'
}

export interface WebcamStatusServerResponse {
    status: WebcamStatus
}
