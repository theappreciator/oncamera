import { Answer } from "dns-packet";
import { DataKeys, MdnsDevice, MdnsServiceTypes, WebcamStatus } from "../types";

/*
    Mock Mdns Devices
*/

const mockLightDevice: MdnsDevice = {
    id: "mock-light-device",
    name: "Mock Light Device",
    host: "mock-light-device",
    ip: "10.0.0.200",
    port: 9143
}

const mockWebcamDevice: MdnsDevice = {
    id: "mock-webcam-device",
    name: "Mock Webcam Device",
    host: "mock-webcam-device",
    ip: "10.0.0.201",
    port: 9143
}

/*
    Mock Webcam Status Responses
*/

const mockWebcamOnlineResponse = {
    status: WebcamStatus.online
};

const mockWebcamOfflineResponse = {
    status: WebcamStatus.offline
};

const mockWebcamIncorrectResponse = {
    status: "garbage"
}

const mockNotWebcamResponse = {
    junk: "value"
}

const mockNotJsonResponse = "somejunk";

/*
    MDNS querys, responses
*/

const publisherServerName = 'Mocked MDNS Publisher Service';
const listenerServerName = 'Mocked MDNS Listener Service';
const mockMdnsServerTcpType = '_mocked_mdns_server._tcp';
const publisherMdnsDataLocal = 'Mocked MDNS Publisher Service.local'
const listenerMdnsDataLocal = 'Mocked MDNS Listener Service.local'
const publisherMdnsTargetLocal = 'mocked-mdns-publisher-service.local';

const getMockResponse = (type?: MdnsServiceTypes) => {
    const actualType = type ?? mockMdnsServerTcpType;
    const answers: Answer[] = [];
    answers.push({
        name: actualType,
        type: 'PTR',
        data: publisherMdnsDataLocal
    });

    const additionals: Answer[] = [];
    additionals.push({
        name: publisherServerName,
        type: 'A',
        ttl: 300,
        data: '10.0.0.202'
    });
    
    additionals.push({
        name: publisherServerName,
        type: 'SRV',
        data: {
            port: 9124,
            weight: 0,
            priority: 10,
            target: publisherMdnsTargetLocal
        }
    });
    const data = [DataKeys.webcamStatus + "=" + WebcamStatus.online]
    const recordTxt: Answer[] = [];
    data.forEach(d => {
        const record: Answer = {
            name: publisherServerName,
            type: "TXT",
            data: d
        }
        recordTxt.push(record);
    });
    additionals.push(...recordTxt);

    return {
        answers: answers,
        additionals: additionals
    }
}

const getMockQuery = (type?: MdnsServiceTypes) => {
    const actualType = type ?? mockMdnsServerTcpType;
    return {
        questions: [
            {
                name: actualType,
                type: 'PTR'
            }
        ]
    }
}



export {
    mockLightDevice,
    mockWebcamDevice,
    mockWebcamOnlineResponse,
    mockWebcamOfflineResponse,
    mockWebcamIncorrectResponse,
    mockNotWebcamResponse,
    mockNotJsonResponse,
    mockMdnsServerTcpType,
    getMockResponse,
    getMockQuery
}