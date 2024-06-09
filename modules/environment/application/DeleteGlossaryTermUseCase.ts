import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Environment from "../domain/Environment"
import type GlossaryTerm from "../domain/GlossaryTerm"

export default class DeleteGlossaryTermUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly glossaryTermRepository: Repository<GlossaryTerm>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const glossaryTerm = await this.glossaryTermRepository.get(id)

        if (!glossaryTerm)
            throw new Error('Glossary term not found')

        const environment = await this.environmentRepository.get(glossaryTerm.parentId)

        if (!environment)
            throw new Error('Environment not found')

        environment.glossaryTermIds = environment.glossaryTermIds.filter(glossaryTermId => glossaryTermId !== id)
        await this.environmentRepository.update(environment)

        await this.glossaryTermRepository.delete(id)
    }
}