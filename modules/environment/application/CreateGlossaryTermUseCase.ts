import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import GlossaryTerm from "../domain/GlossaryTerm";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";

type In = Pick<GlossaryTerm, 'parentId' | 'name' | 'statement'>

export default class CreateGlossaryTermUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly glossaryTermRepository: Repository<GlossaryTerm>
    ) { super() }

    async execute({ parentId, name, statement }: In): Promise<Uuid> {
        const environment = await this.environmentRepository.get(parentId)

        if (!environment)
            throw new Error('Environment not found')

        const glossaryTermId = await this.glossaryTermRepository.add(new GlossaryTerm({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            name,
            statement
        }))

        environment.glossaryTermIds.push(glossaryTermId)
        await this.environmentRepository.update(environment)

        return glossaryTermId
    }
}