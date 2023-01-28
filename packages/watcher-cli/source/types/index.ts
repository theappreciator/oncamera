export interface ElgatoKeyLightResponse {
    numberOfLights: number,
    lights: ElgatoKeyLightStatusResponse[]
}

export interface ElgatoKeyLightStatusResponse {
    on: number,
    brightness: number,
    temperature: number
}