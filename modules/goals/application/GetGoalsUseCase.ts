import UseCase from "~/application/UseCase";
import type Goals from "../domain/Goals";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";

export default class GetGoalsUseCase extends UseCase<Uuid, Goals | undefined> {
    constructor(readonly repository: Repository<Goals>) {
        super()
    }

    async execute(goalsId: Uuid): Promise<Goals | undefined> {
        return await this.repository.get(goalsId)
    }
}