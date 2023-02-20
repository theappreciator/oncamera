import { BaseMdnsObjectService } from "../../source";



describe("MdnsObject", () => {
    it("Can get an instance", () => {
        const mdns = BaseMdnsObjectService.Instance;
        expect(mdns).not.toBeUndefined();
        expect(() => mdns.browser.destroy()).not.toThrow();
    });

    it("Can get the same instance", () => {
        const mdns1 = BaseMdnsObjectService.Instance;
        expect(mdns1).not.toBeUndefined();

        const mdns2 = BaseMdnsObjectService.Instance;
        expect(mdns2).not.toBeUndefined();

        expect(mdns1).toBe(mdns2);
        
        expect(() => mdns1.browser.destroy()).not.toThrow();
    });
});