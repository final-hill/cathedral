import UseCase from "~/application/UseCase";
import type Solution from "../domain/Solution";
import type Repository from "~/application/Repository";
import type { Uuid } from "~/domain/Uuid";

export default class GetSolutionByIdUseCase extends UseCase<Uuid, Solution | undefined> {
    constructor(readonly repository: Repository<Solution>) { super() }

    async execute(id: Uuid): Promise<Solution | undefined> {
        return this.repository.get(id)
    }
}