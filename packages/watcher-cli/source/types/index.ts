export interface ElgatoLight {
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
    data?: MdnsSrv
}

export interface MdnsSrv {
    priority?: number,
    weight?: number,
    port?: number,
    target?: string
}