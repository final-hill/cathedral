import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type GlossaryTerm from "../domain/GlossaryTerm"

export default class GetGlossaryTermsUseCase extends UseCase<Uuid, GlossaryTerm[]> {
    constructor(
        readonly glossaryTermRepository: Repository<GlossaryTerm>
    ) { super() }

    async execute(environmentId: Uuid): Promise<GlossaryTerm[]> {
        return await this.glossaryTermRepository.getAll(
            glossaryTerm => glossaryTerm.parentId === environmentId
        )
    }
}