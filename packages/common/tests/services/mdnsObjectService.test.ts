import "reflect-metadata";
import {container, Lifecycle} from "tsyringe";
import { BaseMdnsObjectService } from "../../source";



describe("MdnsObject", () => {
    beforeAll(() => {
        container.register(
            "IMdnsObjectService",
            { useClass: BaseMdnsObjectService },
            { lifecycle: Lifecycle.Singleton }
          );
    });

    it("Can get an instance", () => {
        const mdns: BaseMdnsObjectService = container.resolve("IMdnsObjectService");

        expect(mdns).not.toBeUndefined();
        expect(() => mdns.browser.destroy()).not.toThrow();
    });

    it("Can get the same instance", () => {
        const mdns1: BaseMdnsObjectService = container.resolve("IMdnsObjectService");
        expect(mdns1).not.toBeUndefined();

        const mdns2: BaseMdnsObjectService = container.resolve("IMdnsObjectService");
        expect(mdns2).not.toBeUndefined();

        expect(mdns1).toBe(mdns2);
        
        expect(() => mdns1.browser.destroy()).not.toThrow();
    });
});