import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type PEGS from "~/domain/PEGS";
import EnvironmentComponent from "../domain/EnvironmentComponent";

type In = Pick<EnvironmentComponent, 'parentId' | 'name' | 'statement'>

export default class CreateEnvironmentComponentUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly pegsRepository: Repository<PEGS>,
        readonly componentRepository: Repository<EnvironmentComponent>
    ) { super() }

    async execute({ parentId, name, statement }: In): Promise<Uuid> {
        const pegs = await this.pegsRepository.get(parentId)

        if (!pegs)
            throw new Error('Parent not found')

        const componentId = await this.componentRepository.add(new EnvironmentComponent({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            name,
            statement
        }))

        pegs.componentIds.push(componentId)
        await this.pegsRepository.update(pegs)

        return componentId
    }
}