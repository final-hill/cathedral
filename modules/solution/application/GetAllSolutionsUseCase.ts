import type Repository from "~/application/Repository"
import type Solution from "../domain/Solution"
import UseCase from "~/application/UseCase"

export default class GetAllSolutionsUseCase extends UseCase<{}, Solution[]> {
    constructor(readonly repository: Repository<Solution>) { super() }

    async execute(): Promise<Solution[]> {
        return this.repository.getAll()
    }
}