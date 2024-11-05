// The server is currently Node 20 which does not support Object.groupBy.
// See: https://github.com/final-hill/cathedral/issues/371
export default function <K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Partial<Record<K, T[]>> {
    return [...items].reduce((acc, item, index) => {
        const key = keySelector(item, index),
            group = (acc as any)[key as any] ?? ((acc as any)[key as any] = [])
        group.push(item)
        return acc
    }, {} as Partial<Record<K, T[]>>)
}