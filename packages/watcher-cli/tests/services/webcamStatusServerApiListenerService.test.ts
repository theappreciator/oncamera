import "reflect-metadata";
import { mockWebcamDevice, mockWebcamOfflineResponse, mockWebcamOnlineResponse } from "@oncamera/common";
import { WebcamStatusServerApiListenerService } from "../../source/services";
import { flushPromises } from "../testingUtils";


describe("WebcamStatusServerApiListenerService", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    
    it("should get api status", async () => {
        jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }
        ) as jest.Mock);

        const webcamApiListenerService = new WebcamStatusServerApiListenerService();

        const onChange = jest.fn();
        webcamApiListenerService.listenForValueChangesFromDevice(mockWebcamDevice, onChange, 1000);
        await flushPromises();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("should get api status on an interval", async () => {
        jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }
        ) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOfflineResponse
                    ),
                })
            }
        ) as jest.Mock);

        const webcamApiListenerService = new WebcamStatusServerApiListenerService();

        const onChange = jest.fn();
        webcamApiListenerService.listenForValueChangesFromDevice(mockWebcamDevice, onChange, 1000);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("should be able to stop", async () => {
        jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }
        ) as jest.Mock);

        const webcamApiListenerService = new WebcamStatusServerApiListenerService();
        expect(() => webcamApiListenerService.stopListening()).not.toThrow();

        const onChange = jest.fn();
        webcamApiListenerService.listenForValueChangesFromDevice(mockWebcamDevice, onChange, 1000);
        await flushPromises();
        expect(onChange).toHaveBeenCalledTimes(1);

        expect(() => webcamApiListenerService.stopListening()).not.toThrow();

    })
})