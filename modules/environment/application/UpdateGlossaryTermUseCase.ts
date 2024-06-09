import UseCase from "~/application/UseCase"
import type GlossaryTerm from "../domain/GlossaryTerm"
import type Repository from "~/application/Repository"

type In = Pick<GlossaryTerm, 'id' | 'name' | 'statement'>

export default class UpdateGlossaryTermUseCase extends UseCase<In, void> {
    constructor(
        readonly glossaryTermRepository: Repository<GlossaryTerm>
    ) { super() }

    async execute({ id, name, statement }: In): Promise<void> {
        const glossaryTerm = await this.glossaryTermRepository.get(id)

        if (!glossaryTerm)
            throw new Error('Glossary term not found')

        Object.assign(glossaryTerm, { name, statement })

        await this.glossaryTermRepository.update(glossaryTerm)
    }
}