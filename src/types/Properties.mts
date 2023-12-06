/**
 * A type that represents all the properties of a type T that are not functions
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]>;