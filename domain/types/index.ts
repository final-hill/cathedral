import { Requirement } from "../requirements/Requirement.js";

export type Constructor<T> = (new (...args: any[]) => T) | (abstract new (...args: any[]) => T);

/**
 * A type that represents all the members of a type T that are not functions
 */
export type Properties<T> = Pick<T, {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]>;

/**
 * Represents a requirement model with relations
 */
// TODO: move to a base DTO object
// possibly related to the following work: https://github.com/final-hill/cathedral/issues/164#issuecomment-2381004280
export type ReqRelModel<R extends Requirement> = R & {
    parentComponent?: string,
    solutionId: string
}