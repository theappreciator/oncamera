import "reflect-metadata";
import {container, Lifecycle} from "tsyringe";
import { MdnsDevice } from "../../source";
import { MockApiListenerService, mockNotWebcamResponse, mockWebcamOfflineResponse, mockWebcamOnlineResponse } from "../../source/mocks";
import { flushPromises } from '../testingUtils';



describe("BaseApiListenerService", () => {

    beforeAll(() => {
        container.register(
            "IApiListenerService",
            { useClass: MockApiListenerService }
      );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.clearAllTimers();
    });

    it("Can make an instance", () => {
        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");

        expect(apiListenerService).not.toBeUndefined();
    });

    it("should return a status", async () => {

        jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }
        ) as jest.Mock);

        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");

        const url = "http://127.0.0.1";
        const key = "status";
        const onChange = jest.fn();
        
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();

        expect(onChange).toHaveBeenCalledTimes(1);

        expect(() => apiListenerService.stopListening()).not.toThrow();
    });


    it("should passively continue running when status key not present in json", async () => {
        jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockNotWebcamResponse
                    ),
                })
            }
        ) as jest.Mock);

        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");

        const url = "http://127.0.0.1";
        const key = "status";
        const onChange = jest.fn();
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();

        expect(onChange).toHaveBeenCalledTimes(0);

        expect(() => apiListenerService.stopListening()).not.toThrow();
    });

    it("should passively continue running when can't reach webcam status server", async () => {
        jest.spyOn(global, "fetch")
            .mockImplementationOnce(jest.fn(() => {
                return Promise.reject("Rejected when trying to hit webcam status server");
            }
        ) as jest.Mock);

        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");

        const url = "http://127.0.0.1";
        const key = "status";
        const onChange = jest.fn();
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();

        expect(onChange).toHaveBeenCalledTimes(0);

        expect(() => apiListenerService.stopListening()).not.toThrow();
    });

    it("should passively continue running when calling stop out of cycle", async () => {
        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");
        expect(() => apiListenerService.stopListening()).not.toThrow();
    });

    it("should passively continue running when calling start out of cycle", async () => {
        jest.spyOn(global, "fetch")
        .mockImplementationOnce(jest.fn(() => {
            return Promise.resolve({ json: () => 
                Promise.resolve(
                    mockWebcamOnlineResponse
                ),
            })
        }) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
            return Promise.resolve({ json: () => 
                Promise.resolve(
                    mockWebcamOfflineResponse
                ),
            })
        }) as jest.Mock);
        
        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");


        const url = "http://127.0.0.1";
        const key = "status";
        const onChange = jest.fn();
        
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();

        expect(onChange).toHaveBeenCalledTimes(2);

        expect(() => apiListenerService.stopListening()).not.toThrow();
    });

    it("should continue running after 1 error and a re-connect", async () => {
        jest.spyOn(global, "fetch")
                .mockImplementationOnce(jest.fn(() => {
                    return Promise.reject("Rejected when trying to hit webcam status server");
                }
            ) as jest.Mock)
            .mockImplementationOnce(jest.fn(() => {
                return Promise.resolve({ json: () => 
                    Promise.resolve(
                        mockWebcamOnlineResponse
                    ),
                })
            }
        ) as jest.Mock);

        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");


        const url = "http://127.0.0.1";
        const key = "status";
        const onChange = jest.fn();
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(onChange).toHaveBeenCalledTimes(1);

        expect(() => apiListenerService.stopListening()).not.toThrow();
    });

    it("should continue running after 5 error and a re-connect", async () => {
        jest.useFakeTimers();

        jest.spyOn(global, "fetch")
        .mockImplementationOnce(jest.fn(() => {
            return Promise.reject("Rejected when trying to hit webcam status server");
        }) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
            return Promise.reject("Rejected when trying to hit webcam status server");
        }) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
            return Promise.reject("Rejected when trying to hit webcam status server");
        }) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
            return Promise.reject("Rejected when trying to hit webcam status server");
        }) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
            return Promise.reject("Rejected when trying to hit webcam status server");
        }) as jest.Mock)
        .mockImplementationOnce(jest.fn(() => {
            return Promise.resolve({ json: () => 
                Promise.resolve(
                    mockWebcamOnlineResponse
                ),
            })
        }) as jest.Mock);

        const apiListenerService: MockApiListenerService = container.resolve("IApiListenerService");

        const url = "http://127.0.0.1";
        const key = "status";
        const onChange = jest.fn();
        apiListenerService.listenForValueChangesFromDevice({} as MdnsDevice, onChange, 1000);
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();
        jest.runOnlyPendingTimers();
        await flushPromises();

        expect(onChange).toHaveBeenCalledTimes(1);

        expect(() => apiListenerService.stopListening()).not.toThrow();
    });
});
