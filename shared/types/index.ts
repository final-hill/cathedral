import type { Collection } from '@mikro-orm/core'

export type Constructor<T> = (new (...args: unknown[]) => T) | (abstract new (...args: unknown[]) => T)

/**
 * A type that represents all the members of a type T that are not functions
 * and are not collections
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never
        : T[K] extends Collection<object> ? never : K
}[keyof T]>
