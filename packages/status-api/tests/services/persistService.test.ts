import exp from "constants";
import PersistService from "../../source/services/persistService";


describe("PersistService", () => {

    describe("class setup", () => {
        it("should be able to instantiate", () => {
            const persist = PersistService.Instance;
            
            expect(persist).not.toBeUndefined();
        });

        it("should be a singleton", () => {
            const persist1 = PersistService.Instance;
            const persist2 = PersistService.Instance;

            expect(persist1).not.toBeUndefined();
            expect(persist1).toBe(persist2);
        });
    });

    describe("class responsibilities", () => {
        it("should be able to return undefined for an unused key", () => {
            const persist = PersistService.Instance;
            const keyName = "doesnt_exist";
            const value = persist.retrieve(keyName);
            
            expect(value).toBeUndefined();
        });

        it("should be able to save to an unused keyname and retrieve from it", () => {
            const persist = PersistService.Instance;
            const keyName = "my_key";
            const expectedValue = "my_value";
            persist.save(keyName, expectedValue);
            const retrievedValue = persist.retrieve(keyName);
            
            expect(retrievedValue).toEqual(expectedValue);
        });

        it("should be able to overwrite a value for an existing keyname", () => {
            const persist = PersistService.Instance;
            const keyName = "existing_key";
            const initialValue = "another_value";
            const expectedValue = "something_new";
            
            persist.save(keyName, initialValue);            
            const initialRetrieved = persist.retrieve(keyName);
            expect(initialRetrieved).toEqual(initialValue);
            
            persist.save(keyName, expectedValue);
            const retrievedValue = persist.retrieve(keyName);
            expect(retrievedValue).toEqual(expectedValue);
        });

        it("should have case insensitive keys", () => {
            const persist = PersistService.Instance;
            const keyName1 = "KEY_NAME";
            const keyName2 = "KEY_name";
            const keyName3 = "key_name";

            const value = "case insensitive value";

            persist.save(keyName1, value);
            
            expect(persist.retrieve(keyName1)).toEqual(value);
            expect(persist.retrieve(keyName2)).toEqual(value);
            expect(persist.retrieve(keyName3)).toEqual(value);
        });

        it ("should have case sensitive values", () => {
            const persist = PersistService.Instance;
            const keyName = "case_sensitive_value_test";
            
            const value1 = "CASE";
            const value2 = "Case";
            const value3 = "case";

            persist.save(keyName, value1);
            
            expect(persist.retrieve(keyName)).toEqual(value1);
            expect(persist.retrieve(keyName)).not.toEqual(value2);
            expect(persist.retrieve(keyName)).not.toEqual(value3);
        })

        it ("should be able to clear all existing values", () => {
            const persist = PersistService.Instance;
            const keyName1 = "KEY_NAME";
            const keyName2 = "KEY_name";
            const keyName3 = "key_name";

            const value = "case insensitive value";

            for (let i = 1; i <= 10; i++) {
                const key = "key" + i.toString();
                const value = "value" + i.toString();
                persist.save(key, value);
            }

            expect(persist.retrieve("key1")).toEqual("value1");
            expect(persist.retrieve("key10")).toEqual("value10");

            persist.clearAll();

            expect(persist.retrieve("key1")).toBeUndefined();
            expect(persist.retrieve("key10")).toBeUndefined();
        })

    });
})