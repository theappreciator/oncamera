

class Persist {

    private store: Map<string, string>;

    private static _instance: Persist;

    private constructor() {
        this.store = new Map();
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public save(key: string, value: string) {
        this.store.set(key, value);
    }

    public retrieve(key: string) {
        return this.store.get(key);
    }
}

export default Persist;