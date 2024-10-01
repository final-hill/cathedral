import { type Collection } from '@mikro-orm/core';

/**
 * For each property of a type T, if the property is a Collection<U>, then replace it with U[]
 */
export type CollectionToArrayProps<T> = {
    [P in keyof T]: T[P] extends Collection<infer U> ? U[] : T[P];
};

/**
 * A type that represents all the members of a type T that are not functions
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]>;