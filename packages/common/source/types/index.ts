export interface MdnsDevice {
    id: string,
    name: string,
    host: string,
    ip: string,
    port: number
}

export interface ElgatoKeyLightResponse {
    numberOfLights: number,
    lights: ElgatoKeyLightStatusResponse[]
}

export interface ElgatoKeyLightStatusResponse {
    on: number,
    brightness: number,
    temperature: number
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