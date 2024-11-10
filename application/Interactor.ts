import type { EntityRepository } from "@mikro-orm/core";

/**
 * An Interactor is a class that contains the business logic of an application.
 * It has the Single Responsibility (SRP) of interacting with a particular entity.
 * @see https://softwareengineering.stackexchange.com/a/364727/420292
 */
export default abstract class Interactor<T extends object> {
    private readonly _repository: EntityRepository<T>;

    constructor({ repository }: { repository: EntityRepository<T> }) {
        this._repository = repository;
    }

    get repository(): EntityRepository<T> {
        return this._repository;
    }
}