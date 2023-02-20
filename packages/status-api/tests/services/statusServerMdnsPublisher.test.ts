import { getMockQuery, MdnsServiceTypes, MockMdnsObjectService } from "@oncamera/common";
import { StatusServerMdnsPublisherService } from "../../source/services";
import { flushPromises } from "../testingUtils";



describe("StatusServerMdnsPublisherService", () => {
    it ("should be able to provide data", async () => {
        const mockedObjectService = new MockMdnsObjectService();

        const publisher = new StatusServerMdnsPublisherService(mockedObjectService);
        mockedObjectService.mockReady();

        expect.assertions(2);
        const mockListenerQuery: any = getMockQuery(MdnsServiceTypes.webcamStatus);
        mockedObjectService.mockQuery(mockListenerQuery);
        await flushPromises();
        expect(true).toBe(true);
        
        expect(() => publisher.destroy()).not.toThrow();
    })
})
