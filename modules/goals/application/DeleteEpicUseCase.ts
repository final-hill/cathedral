import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Epic from "../domain/Epic";
import type { Uuid } from "~/domain/Uuid";

export default class DeleteEpicUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly epicRepository: Repository<Epic>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        await this.epicRepository.delete(id)
    }
}