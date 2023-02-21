import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
import { getMockQuery, MdnsServiceTypes, MockMdnsObjectService } from "@oncamera/common";
import { StatusServerMdnsPublisherService } from "../../source/services";
import { flushPromises } from "../testingUtils";



describe("StatusServerMdnsPublisherService", () => {
    beforeAll(() => {
        container.register(
            "IMdnsObjectService",
            { useClass: MockMdnsObjectService },
            { lifecycle: Lifecycle.Singleton }
        );
    });

    it ("should be able to provide data", async () => {
        const mockMdnsObjectService: MockMdnsObjectService = container.resolve("IMdnsObjectService");

        const publisher = container.resolve(StatusServerMdnsPublisherService);
        mockMdnsObjectService.mockReady();

        expect.assertions(2);
        const mockListenerQuery: any = getMockQuery(MdnsServiceTypes.webcamStatus);
        mockMdnsObjectService.mockQuery(mockListenerQuery);
        await flushPromises();
        expect(true).toBe(true);
        
        expect(() => publisher.destroy()).not.toThrow();
    })
})
