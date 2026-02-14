import { date } from "zod";

const store = new Map();

export function cacheGet(key){
    const item = store.get(key);
    if (!item) return null;
    if (Date.now() > item.exp) {
        store.delete(key);
        return null;

    }
    return item.val;
}
export function cacheSet(key, val, ttl){
    store.set(key, {val, exp: Date.now() + ttl});
}
