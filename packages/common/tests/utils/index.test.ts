import "reflect-metadata";
import { delay } from "../../source";

describe(("delay"), () => {
    it("should delay for 800ms", async () => {
        const delayTimeMs = 800;
        
        const startTime = new Date().getTime();
        Promise.resolve().then(v => {
            return delay(delayTimeMs, v)
        })
        .then(v => {
            const endTime = new Date().getTime();
            const elapsedTime = endTime - startTime;
    
            expect(elapsedTime).toBeGreaterThanOrEqual(delayTimeMs);
        })
        .catch(e => {
            expect(false).toBe(true);
        })
    });

    it("should delay for no time (less then 100ms)", async () => {
        const delayTimeMs = 0;
        
        const startTime = new Date().getTime();
        Promise.resolve().then(v => {
            return delay(delayTimeMs, v)
        })
        .then(v => {
            const endTime = new Date().getTime();
            const elapsedTime = endTime - startTime;
    
            expect(elapsedTime).toBeGreaterThanOrEqual(delayTimeMs);
            expect(elapsedTime).toBeLessThanOrEqual(200);
        })
        .catch(e => {
            expect(false).toBe(true);
        })
    });

    it("should pass through a value", async () => {
        const delayTimeMs = 0;
        const someValue = 9999;
        
        Promise.resolve(someValue)
        .then(v => {
            return delay(delayTimeMs, v)
        })
        .then(v => {
            expect(v).toBe(someValue);
        })
        .catch(e => {
            expect(false).toBe(true);
        })
    });
});