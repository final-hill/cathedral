import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import type Outcome from "../domain/Outcome"

export default class GetOutcomesUseCase extends UseCase<Uuid, Outcome[] | undefined> {
    constructor(readonly repository: Repository<Outcome>) {
        super()
    }

    async execute(goalsId: Uuid): Promise<Outcome[] | undefined> {
        return await this.repository.getAll((outcome: Outcome) => outcome.parentId === goalsId)
    }
}