

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
        this.store.set(key.toLowerCase(), value);
    }

    public retrieve(key: string) {
        return this.store.get(key.toLowerCase());
    }

    public clearAll() {
        this.store.clear();
    }
}

export default Persist;