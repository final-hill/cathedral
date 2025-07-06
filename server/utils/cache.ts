import NodeCache from 'node-cache'

const cache = new NodeCache()

export default {
    set(key: string, value: unknown, { ttl }: { ttl: number }) {
        cache.set(key, value, ttl)
    },
    get<T>(key: string): T | undefined {
        return cache.get<T>(key)
    },
    del(key: string) {
        cache.del(key)
    }
}
