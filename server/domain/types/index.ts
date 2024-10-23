import { Requirement } from "../requirements/Requirement.js";

/**
 * A type that represents all the members of a type T that are not functions
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]>;

/**
 * Represents a requirement model with relations
 */
export type ReqRelModel<R extends Requirement> = R & {
    parentComponent?: string,
    solutionId: string
}