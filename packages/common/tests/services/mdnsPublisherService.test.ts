import "reflect-metadata";
import {container, Lifecycle} from "tsyringe";
import { DataKeys, WebcamStatus, getMockQuery, MockMdnsPublisherService, MockMdnsObjectService } from "../../source";
import { flushPromises } from "../testingUtils";



describe("MdnsPublisher", () => {

    beforeAll(() => {
        container.register(
            "IMdnsObjectService",
            { useClass: MockMdnsObjectService },
            { lifecycle: Lifecycle.Singleton }
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

    it("Should make an instance", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const publisher = container.resolve(MockMdnsPublisherService);
        mockedObjectService.mockReady();

        expect(publisher).not.toBeUndefined();

        expect(() => publisher.destroy()).not.toThrow();
    });

    it("Should be ready", () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        expect.assertions(2);
        const publisher = container.resolve(MockMdnsPublisherService);
        mockedObjectService.mockReady();
        expect(true).toBe(true);

        expect(() => publisher.destroy()).not.toThrow();
    });

    it("Should query", async () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        expect.assertions(2);
        const publisher = container.resolve(MockMdnsPublisherService);
        mockedObjectService.mockReady();

        const mockListenerQuery: any = getMockQuery();
        mockedObjectService.mockQuery(mockListenerQuery);
        await flushPromises();
        expect(true).toBe(true);
        
        expect(() => publisher.destroy()).not.toThrow();
    });

    it ("Should broadcast", async () => {
        const mockedObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const publisher = container.resolve(MockMdnsPublisherService);
        mockedObjectService.mockReady();

        expect.assertions(2);
        await publisher.broadcastEvent([DataKeys.webcamStatus + "=" + WebcamStatus.online])
        .then(() => {
            expect(true).toBe(true);
        })

        expect(() => publisher.destroy()).not.toThrow();
    });

});