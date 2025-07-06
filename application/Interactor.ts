import type { Repository } from '~/server/data/repositories/Repository'

/**
 * An Interactor is a class that contains the business logic for a collection of related use cases
 * It has the Single Responsibility (SRP) of interacting with a particular entity.
 * @see https://softwareengineering.stackexchange.com/a/364727/420292
 */
// TODO: E should be a type that extends Entity | ValueObject
// Though more accurately, should be a type that implements Equatable
export abstract class Interactor<E> {
    protected readonly _repository

    /**
     * Create a new Interactor
     *
     * @param props.repository - The repository to use
     * @param props.userId - The id of the user to utilize
     */
    constructor(props: {
        repository: Repository<E>
    }) {
        this._repository = props.repository
    }
}
