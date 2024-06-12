import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Person from "../domain/Person"
import type Repository from "~/application/Repository"

export default class DeletePersonUseCase extends UseCase<Uuid, void> {
    constructor(readonly repository: Repository<Person>) {
        super()
    }

    async execute(id: Uuid): Promise<void> {
        return await this.repository.delete(id)
    }
}