import UseCase from "~/application/UseCase";
import type Person from "../domain/Person";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";

export default class GetPersonnelUseCase extends UseCase<Uuid, Person[] | undefined> {
    constructor(readonly repository: Repository<Person>) {
        super()
    }

    async execute(projectId: Uuid): Promise<Person[] | undefined> {
        return this.repository.getAll(p => p.projectId === projectId)
    }
}