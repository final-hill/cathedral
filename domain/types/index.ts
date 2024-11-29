import type { Collection } from "@mikro-orm/core";

export type Constructor<T> = (new (...args: any[]) => T) | (abstract new (...args: any[]) => T);

/**
 * A type that represents all the members of a type T that are not functions
 * and are not collections
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never :
    T[K] extends Collection<any> ? never : K
}[keyof T]>;