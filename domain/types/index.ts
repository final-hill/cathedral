import type { Collection } from "@mikro-orm/core";

export type Constructor<T> = (new (...args: any[]) => T) | (abstract new (...args: any[]) => T);

/**
 * A type that represents all the members of a type T that are not functions
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]>;


/**
 * A type that converts all the Collection properties of a type T to optional array properties
 */
export type CollectionPropsToOptionalArrays<T> = {
    [K in keyof T]: T[K] extends Collection<infer U> ? U[] | undefined : T[K]
}