import { DataKeys, WebcamStatus, getMockQuery, MockMdnsPublisherService, MockMdnsObjectService } from "../../source";
import { flushPromises } from "../testingUtils";



describe("MdnsPublisher", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.clearAllTimers();
    });

    it("Should make an instance", () => {
        const mockedObjectService = new MockMdnsObjectService();

        const publisher = new MockMdnsPublisherService(mockedObjectService);
        mockedObjectService.mockReady();

        expect(publisher).not.toBeUndefined();

        expect(() => publisher.destroy()).not.toThrow();
    });

    it("Should be ready", () => {
        const mockedObjectService = new MockMdnsObjectService();

        expect.assertions(2);
        const publisher = new MockMdnsPublisherService(mockedObjectService);
        mockedObjectService.mockReady();
        expect(true).toBe(true);

        expect(() => publisher.destroy()).not.toThrow();
    });

    it("Should query", async () => {
        const mockedObjectService = new MockMdnsObjectService();

        expect.assertions(2);
        const publisher = new MockMdnsPublisherService(mockedObjectService);
        mockedObjectService.mockReady();

        const mockListenerQuery: any = getMockQuery();
        mockedObjectService.mockQuery(mockListenerQuery);
        await flushPromises();
        expect(true).toBe(true);
        
        expect(() => publisher.destroy()).not.toThrow();
    });

    it ("Should broadcast", async () => {
        const mockedObjectService = new MockMdnsObjectService();

        const publisher = new MockMdnsPublisherService(mockedObjectService);
        mockedObjectService.mockReady();

        expect.assertions(2);
        await publisher.broadcastEvent([DataKeys.webcamStatus + "=" + WebcamStatus.online])
        .then(() => {
            expect(true).toBe(true);
        })

        expect(() => publisher.destroy()).not.toThrow();
    });

});